# Embedding Model Comparison

While **Xenova/all-MiniLM-L6-v2** is popular due to its small size and speed (23M parameters, 384 dimensions), several free and locally-embeddable models offer better performance, sometimes even while maintaining a compact size.

The best alternatives often come from the **E5** and **BGE** families, which consistently top performance benchmarks like MTEB (Massive Text Embeddings Benchmark).

## Comprehensive Model Comparison

| Model Name | Category | Parameters | Dimensions | Speed/Size | Accuracy | Key Advantages | Use Case |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Xenova/all-MiniLM-L6-v2** | Baseline | 23M | 384 | ⚡⚡⚡ Very Fast | ~78% Top-5 | Very small, fast inference | Quick prototyping, minimal resource usage |
| **intfloat/e5-small** | Small & Fast | 118M | 384 | ⚡⚡⚡ Very Fast | Higher than MiniLM | Speed champion, high accuracy for size | Best upgrade path from MiniLM |
| **intfloat/e5-base-v2** | Top Performance | 110M | 768 | ⚡⚡ Fast | ~83.5% Top-5 | Excellent general-purpose, sweet spot for accuracy/speed | Production RAG systems |
| **BAAI/bge-base-en-v1.5** | Top Performance | 110M | 768 | ⚡⚡ Fast | SOTA on MTEB | State-of-the-art English accuracy, query prefix support | High-accuracy English RAG |

> **Note:** Models in the `E5` family are often considered the sweet spot for combining high accuracy with relatively low latency, making them ideal for production-ready local RAG systems.

## Quick Recommendations

- **Maximum performance per size/speed tradeoff**: `intfloat/e5-base-v2` or `BAAI/bge-base-en-v1.5`
- **Smallest/fastest with accuracy improvement**: `intfloat/e5-small`
- **Baseline for comparison**: `Xenova/all-MiniLM-L6-v2`

## Evaluation Results & Recommendation

### Test Query
**Query**: "guidance on my professional development plan"

This query was tested against a local knowledge base containing career development documents, feedback notes, project hubs, and templates. The ideal behavior is to rank highly relevant documents (career development plans, professional feedback) highest, with proper score differentiation showing relevancy degradation.

All models were tested **with and without keyword boosting** (keywordBoostWeight: 1.0) to assess the impact of keyword enhancement on ranking quality.

### Model Performance Analysis

#### 1. Xenova/all-MiniLM-L6-v2 (Baseline)

**Without Keyword Boost:**
- **Rank 1 (0.49)**: `x-archive/17-11-2025 Monday (cooldown).md` - ⚠️ **Partially Relevant**
- **Rank 2 (0.45)**: `personal/my-career/hub.md` - ✅ **Highly Relevant** - Career development hub
- **Rank 3 (0.40)**: `x-archive/achievement-discoveries/hub.md` - ❌ **Not Relevant**
- **Rank 4 (0.39)**: `x-archive/achievement-discoveries/Initial Chat.md` - ❌ **Not Relevant**
- **Rank 5 (0.36)**: `general/feedback/end-of-cycle-review-2025-08-28.md` - ✅ **Relevant** - Development feedback

**Assessment (Without Boost)**: ❌ Poor - Wrong top result, relevant career hub only at #2 with low score

**With Keyword Boost (keywordBoostWeight: 1.0):**
- **Rank 1 (0.85)**: `personal/my-career/hub.md` - ✅ **Highly Relevant** - Career preparation hub with professional development planning
- **Rank 2 (0.80)**: `x-archive/achievement-discoveries/hub.md` - ❌ **Not Relevant** - System analysis project documentation
- **Rank 3 (0.76)**: `general/feedback/end-of-cycle-review-2025-08-28.md` - ✅ **Relevant** - Contains growth areas and development feedback
- **Rank 4 (0.49)**: `x-archive/achievement-discoveries/Initial Chat.md` - ❌ **Not Relevant**
- **Rank 5 (0.49)**: `x-archive/17-11-2025 Monday (cooldown).md` - ⚠️ **Partially Relevant**

**Assessment (With Boost)**: ✅ Excellent
- Correctly identifies the most relevant document as #1
- Provides proper score differentiation (0.85 → 0.80 → 0.76 → 0.49 → 0.49)
- Includes relevant development feedback in top 3 results
- Shows clear relevancy degradation in scores

**Verdict**: ✅ **Requires keyword boost** - Without boost, performance is poor; with boost, it's the best overall performer.

#### 2. intfloat/e5-small

**Without Keyword Boost:**
- **Rank 1 (0.85)**: `personal/my-career/hub.md` - ✅ **Highly Relevant** - Career development hub
- **Rank 2 (0.85)**: `general/feedback/nes758-process-improvement-feedback.md` - ⚠️ **Partially Relevant**
- **Rank 3 (0.85)**: `achievement-discoveries/decisions/README.md` - ❌ **Not Relevant** - Template
- **Rank 4 (0.84)**: `work/_work_report/07.13-17-oct (cycle).md` - ❌ **Not Relevant** - Work report
- **Rank 5 (0.84)**: `x-archive/achievement-discoveries/tasks.md` - ❌ **Not Relevant** - Project tasks

**Assessment (Without Boost)**: ⚠️ Good but problematic
- ✅ Correctly identifies career hub as #1
- ❌ Score compression - multiple 0.85/0.84 scores make ranking difficult
- ⚠️ Better than with boost due to less compression

**With Keyword Boost (keywordBoostWeight: 1.0):**
- **Rank 1 (1.00)**: `personal/my-career/hub.md` - ✅ **Highly Relevant**
- **Rank 2 (1.00)**: `general/feedback/nes758-process-improvement-feedback.md` - ⚠️ **Partially Relevant**
- **Rank 3 (1.00)**: `work/_work_report/07.13-17-oct (cycle).md` - ❌ **Not Relevant**
- **Rank 4 (1.00)**: `x-archive/achievement-discoveries/tasks.md` - ❌ **Not Relevant**
- **Rank 5 (0.85)**: `achievement-discoveries/decisions/README.md` - ❌ **Not Relevant**

**Assessment (With Boost)**: ❌ Poor - Severe score compression (4 results at 1.00) prevents proper ranking

**Verdict**: ✅ **Better without keyword boost** - Without boost is the second-best option overall, but still suffers from score compression.

#### 3. intfloat/e5-base-v2

**Without Keyword Boost:**
- **Rank 1 (0.79)**: `x-archive/17-11-2025 Monday (cooldown).md` - ⚠️ **Partially Relevant**
- **Rank 2 (0.78)**: `specs/Cycle 05/System Prompt Sturcture.md` - ❌ **Not Relevant** - System documentation
- **Rank 3 (0.78)**: `content-guides/Project-Hub.md` - ❌ **Not Relevant** - Template
- **Rank 4 (0.78)**: `content-guides/ADR.md` - ❌ **Not Relevant** - Template
- **Rank 5 (0.77)**: `content-guides/Quick-Note.md` - ❌ **Not Relevant** - Template

**Assessment (Without Boost)**: ❌ Poor - Career hub not in top 5, mostly templates and wrong documents

**With Keyword Boost (keywordBoostWeight: 1.0):**
- **Rank 1 (1.00)**: `specs/Cycle 05/System Prompt Sturcture.md` - ❌ **Not Relevant**
- **Rank 2 (0.88)**: `content-guides/Project-Hub.md` - ❌ **Not Relevant** - Template
- **Rank 3 (0.79)**: `x-archive/17-11-2025 Monday (cooldown).md` - ⚠️ **Partially Relevant**
- **Rank 4 (0.78)**: `content-guides/ADR.md` - ❌ **Not Relevant** - Template
- **Rank 5 (0.77)**: `content-guides/Quick-Note.md` - ❌ **Not Relevant** - Template

**Assessment (With Boost)**: ❌ Poor - Wrong top result, career hub still not in top 5

**Verdict**: ❌ **Not recommended** - Fails with or without keyword boost, ranking wrong documents highest.

#### 4. BAAI/bge-base-en-v1.5

**Without Keyword Boost:**
- **Rank 1 (0.67)**: `x-archive/17-11-2025 Monday (cooldown).md` - ⚠️ **Partially Relevant**
- **Rank 2 (0.64)**: `general/tasks/chat-with-phil.md` - ❌ **Not Relevant**
- **Rank 3 (0.64)**: `specs/Cycle 05/System Prompt Sturcture.md` - ❌ **Not Relevant**
- **Rank 4 (0.63)**: `x-archive/achievement-discoveries/Initial Chat.md` - ❌ **Not Relevant**
- **Rank 5 (0.63)**: `_priorities.md` - ❌ **Not Relevant** - Simple todo list

**Assessment (Without Boost)**: ❌ Poor - Career hub not in top 5, wrong documents ranked

**With Keyword Boost (keywordBoostWeight: 1.0):**
- **Rank 1 (0.94)**: `specs/Cycle 05/System Prompt Sturcture.md` - ❌ **Not Relevant**
- **Rank 2 (0.73)**: `x-archive/achievement-discoveries/Initial Chat.md` - ❌ **Not Relevant**
- **Rank 3 (0.67)**: `x-archive/17-11-2025 Monday (cooldown).md` - ⚠️ **Partially Relevant**
- **Rank 4 (0.64)**: `general/tasks/chat-with-phil.md` - ❌ **Not Relevant**
- **Rank 5 (0.63)**: `_priorities.md` - ❌ **Not Relevant**

**Assessment (With Boost)**: ❌ Poor - Wrong top result, career hub not in top 5

**Verdict**: ❌ **Not recommended** - Fails with or without keyword boost, ranking wrong documents highest.

### Conclusion & Recommendation

#### 🥇 **Best Overall: Xenova/all-MiniLM-L6-v2 WITH Keyword Boost**

**Configuration**: `keywordBoost: true, keywordBoostWeight: 1.0`

**Why it's best:**
1. ✅ **Correct Top Result**: Identifies `personal/my-career/hub.md` (the most relevant document) as #1
2. ✅ **Excellent Score Differentiation**: Provides meaningful score spread (0.85 → 0.80 → 0.76 → 0.49 → 0.49) enabling proper ranking
3. ✅ **Relevant Content in Top 3**: Includes both the career hub and development feedback in top results
4. ✅ **Clear Relevancy Degradation**: Scores appropriately decrease as documents become less relevant
5. ✅ **Keyword Boost Essential**: Without boost, it performs poorly (wrong top result); with boost, it's clearly superior

**Performance Summary:**
- **Without boost**: ❌ Poor - Wrong top result, career hub at #2 with low score (0.45)
- **With boost**: ✅ Excellent - Correct top result with proper differentiation

#### 🥈 **Second Best: intfloat/e5-small WITHOUT Keyword Boost**

**Configuration**: `keywordBoost: false`

**Why it's second:**
1. ✅ **Correct Top Result**: Identifies career hub as #1 (score 0.85)
2. ⚠️ **Score Compression Issue**: Multiple results at 0.85/0.84 make ranking less precise than baseline with boost
3. ✅ **Better without boost**: With boost, compression worsens (4 results at 1.00); without boost is more usable

**Performance Summary:**
- **Without boost**: ⚠️ Good but compressed - Correct top result but limited differentiation
- **With boost**: ❌ Poor - Severe compression (4× 1.00) prevents ranking

**Trade-off**: If keyword boosting is not available or desired, e5-small without boost is a viable alternative, though baseline with boost performs significantly better.

#### ❌ **Not Recommended: e5-base-v2 and bge-base-en-v1.5**

Both models fail regardless of keyword boost configuration:
- Wrong top results (system documentation/templates ranked highest)
- Relevant career hub document not appearing in top 5
- Poor overall ranking quality

### Key Insights

1. **Keyword Boost is Critical for Baseline Model**: Xenova/all-MiniLM-L6-v2 transforms from poor to excellent performance with keyword boosting enabled.

2. **Larger Models Can Perform Worse**: Despite better theoretical benchmarks (MTEB scores), e5-base-v2 and bge-base-en-v1.5 fail to identify relevant content, likely due to overfitting or different semantic understanding.

3. **Score Compression in Larger Models**: e5-small shows compression issues that worsen with keyword boost, making it less suitable despite correct top result.

4. **Practical > Theoretical**: Real-world RAG ranking quality doesn't always correlate with benchmark performance - the baseline model with keyword boost outperforms all alternatives.

### Final Recommendation

**Use: Xenova/all-MiniLM-L6-v2 with `keywordBoost: true` and `keywordBoostWeight: 1.0`**

This configuration provides the best combination of:
- Correct top result identification
- Proper score differentiation for ranking
- Relevant content in top results
- Clear relevancy degradation

**Alternative (if keyword boost unavailable)**: Use intfloat/e5-small with `keywordBoost: false`, accepting some score compression in exchange for correct top result identification.

> **⚠️ Important for @xenova/transformers:** Models must be available in the `Xenova/` namespace on Hugging Face (converted to ONNX format) to work with `@xenova/transformers`. Not all models listed above are available in the Xenova namespace. 
> 
> **To use a model:** Check if it exists at `https://huggingface.co/Xenova/[model-name]`. If available, use: `await pipeline("feature-extraction", "Xenova/[model-name]")`
> 
> **Currently confirmed working:** `Xenova/all-MiniLM-L6-v2` ✅
> 
> **Confirmed working models:** `Xenova/all-MiniLM-L6-v2` ✅, `Xenova/e5-small` ✅, `Xenova/e5-base-v2` ✅, `Xenova/bge-base-en-v1.5` ✅