import { ISourceProcessor, SourceItem } from "./types";
import { StaticConfig } from "../services/configService";
import { IVectorEmbedder } from "../types";
import {
    IVectorCollectionService,
    IVectorStorageService,
} from "../ragSearch/types";

export const DOCS_COLLECTION = "docs";
const VECTOR_DISTANCE = "Cosine";
const BATCH_SIZE = 250;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 1000;

interface CustomPoint {
    id: number;
    vector: number[];
    payload: {
        content: string;
        contentType: number;
        sourceType: number;
        sourceLocation: string;
    }
}

/**
 * Indexes documents into vector collections for RAG (Retrieval-Augmented Generation) pipeline.
 * Orchestrates: processing source documents, generating embeddings, and storing in vector collections.
 * Uses domain interfaces - technology-agnostic in its orchestration logic.
 */
export class RAGIndexer {
    private _fileProcessor: ISourceProcessor;
    private _embedder: IVectorEmbedder;
    private _collectionService: IVectorCollectionService;
    private _storageService: IVectorStorageService;
    private _staticConfig: StaticConfig;

    constructor(
        fileProcessor: ISourceProcessor,
        embedder: IVectorEmbedder,
        collectionService: IVectorCollectionService,
        storageService: IVectorStorageService,
        staticConfig: StaticConfig
    ) {
        this._fileProcessor = fileProcessor;
        this._embedder = embedder;
        this._collectionService = collectionService;
        this._storageService = storageService;
        this._staticConfig = staticConfig;
    }

    public async init(): Promise<void> {
        const collectionName = DOCS_COLLECTION;
        console.log(`Initializing collection: ${collectionName}`);

        // Always delete existing collection if it exists
        const exists = await this._collectionService.collectionExists(collectionName);
        if (exists) {
            console.log(`Deleting existing collection: ${collectionName}`);
            await this._collectionService.deleteCollection(collectionName);
        }

        // Always create and populate
        await this._collectionService.createCollection(collectionName, {
            vectorSize: this._staticConfig.vectorSize,
            distance: VECTOR_DISTANCE,
        });

        await this.populate(collectionName);
        console.log(`Collection ${collectionName} initialized and populated`);
    }

    private async generatePoints(sourceItems: ReadonlyArray<SourceItem>): Promise<Array<CustomPoint>> {
        const points: Array<CustomPoint> = [];
        for (let index = 0; index < sourceItems.length; index++) {
            const sourceItem = sourceItems[index];
            points.push({
                id: index,
                vector: await this._embedder.embed(sourceItem.content),
                payload: {
                    content: sourceItem.content,
                    contentType: sourceItem.contentType,
                    sourceType: sourceItem.sourceType,
                    sourceLocation: sourceItem.sourceLocation,
                },
            });
        }
        return points;
    }

    private chunk<T>(arr: T[], size: number): T[][] {
        if (size <= 0) throw new Error("Chunk size must be > 0");
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    private async upsertWithRetry(
        collectionName: string,
        batch: Array<CustomPoint>,
        batchIndex: number,
        totalBatches: number,
        totalPoints: number
    ): Promise<void> {
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                await this._storageService.upsert(collectionName, batch);
                const startIdx = batchIndex * BATCH_SIZE;
                const endIdx = Math.min((batchIndex + 1) * BATCH_SIZE, totalPoints) - 1;
                console.log(`Batch upload ${batchIndex + 1}/${totalBatches}: ${startIdx} - ${endIdx}`);
                return; // Success, exit retry loop
            } catch (error) {
                retries++;
                const errorMessage = error instanceof Error ? error.message : String(error);

                if (retries < MAX_RETRIES) {
                    console.log(`Batch ${batchIndex + 1} failed (attempt ${retries}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS}ms...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    continue;
                }

                throw new Error(
                    `Failed to upload batch ${batchIndex + 1}/${totalBatches} after ${retries} attempts: ${errorMessage}`
                );
            }
        }
    }

    private async populate(collectionName: string): Promise<void> {
        console.log(`Starting population of collection: ${collectionName}`);
        const sourceItems = this._fileProcessor.process();
        const points = await this.generatePoints(sourceItems);
        const batches = this.chunk(points, BATCH_SIZE);

        for (let i = 0; i < batches.length; i++) {
            await this.upsertWithRetry(collectionName, batches[i], i, batches.length, points.length);
        }
        console.log(`Population complete for collection: ${collectionName}`);
    }
}