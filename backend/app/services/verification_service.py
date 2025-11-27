"""
Verification Service - Orchestrates the multi-agent verification pipeline
"""
from typing import Dict, Any, List, Optional
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import Vertical, ClaimResult, VerificationSummary
from app.agents.pipeline import VerificationPipeline

logger = structlog.get_logger()


class VerificationService:
    """
    Main service for orchestrating content verification.
    Uses LangGraph multi-agent pipeline for claim extraction and verification.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.pipeline = VerificationPipeline()
    
    async def verify(
        self,
        text: str,
        url: Optional[str] = None,
        vertical: Optional[Vertical] = Vertical.GENERAL,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Run full verification pipeline on text content.
        
        Args:
            text: The text content to verify
            url: Optional source URL
            vertical: Content category for optimized processing
            language: Content language
            
        Returns:
            Dictionary containing claims, verdicts, scores, and metadata
        """
        logger.info(
            "Starting verification service",
            text_length=len(text),
            vertical=vertical,
            language=language
        )
        
        # Run the multi-agent pipeline
        result = await self.pipeline.run(
            text=text,
            url=url,
            vertical=vertical.value if vertical else "general",
            language=language
        )
        
        # Calculate page score
        page_score = self._calculate_page_score(result["claims"])
        
        # Generate summary
        summary = self._generate_summary(result["claims"])
        
        return {
            "claims": result["claims"],
            "page_score": page_score,
            "summary": summary,
            "models_used": result.get("models_used", ["gpt-4o"]),
            "sources_checked": result.get("sources_checked", 0)
        }
    
    def _calculate_page_score(self, claims: List[ClaimResult]) -> int:
        """
        Calculate overall page score based on claim verdicts.
        
        Score = weighted average of claim confidences by importance
        """
        if not claims:
            return 50  # Neutral score for no claims
        
        verdict_weights = {
            "strongly_supported": 1.0,
            "supported": 0.8,
            "mixed": 0.5,
            "weak": 0.3,
            "contradicted": 0.0,
            "outdated": 0.4,
            "not_verifiable": 0.5
        }
        
        total_weight = 0
        weighted_sum = 0
        
        for i, claim in enumerate(claims):
            # Earlier claims (headline, intro) get higher importance
            position_weight = 1.0 + (0.5 / (i + 1))
            
            verdict_score = verdict_weights.get(claim.verdict.value, 0.5)
            claim_score = verdict_score * claim.confidence
            
            weighted_sum += claim_score * position_weight
            total_weight += position_weight
        
        if total_weight == 0:
            return 50
        
        return int((weighted_sum / total_weight) * 100)
    
    def _generate_summary(self, claims: List[ClaimResult]) -> VerificationSummary:
        """Generate summary of verdict counts."""
        summary = VerificationSummary()
        
        for claim in claims:
            verdict = claim.verdict.value
            if verdict == "strongly_supported":
                summary.strongly_supported += 1
            elif verdict == "supported":
                summary.supported += 1
            elif verdict == "mixed":
                summary.mixed += 1
            elif verdict == "weak":
                summary.weak += 1
            elif verdict == "contradicted":
                summary.contradicted += 1
            elif verdict == "outdated":
                summary.outdated += 1
            else:
                summary.not_verifiable += 1
        
        return summary
