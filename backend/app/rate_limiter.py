import time
from typing import Dict, Optional
from dataclasses import dataclass
from fastapi import HTTPException

@dataclass
class RateLimitInfo:
    """Information about rate limiting for a specific key"""
    last_request_time: float
    request_count: int
    failure_count: int
    last_failure_time: Optional[float] = None
    is_blocked: bool = False
    block_until: Optional[float] = None

class RateLimiter:
    """Rate limiter to prevent excessive API calls and handle failures gracefully"""
    
    def __init__(self):
        self.requests: Dict[str, RateLimitInfo] = {}
        
        # Configuration
        self.max_requests_per_minute = 15  # Increased from 10 to 15 requests per minute per user/IP
        self.max_failures_before_block = 3  # Increased from 2 to 3 consecutive failures before blocking
        self.failure_block_duration = 180  # Reduced from 300 to 180 seconds (3 minutes) for faster recovery
        self.request_window = 60  # 1 minute window for rate limiting
        
    def get_rate_limit_key(self, user_identifier: str, ip_address: str = "unknown") -> str:
        """Generate a unique key for rate limiting based on user and IP"""
        return f"{user_identifier}:{ip_address}"
    
    def check_rate_limit(self, key: str) -> bool:
        """Check if the request should be allowed based on rate limiting rules"""
        current_time = time.time()
        
        if key not in self.requests:
            self.requests[key] = RateLimitInfo(
                last_request_time=current_time,
                request_count=1,
                failure_count=0
            )
            return True
        
        rate_info = self.requests[key]
        
        # Check if currently blocked due to failures
        if rate_info.is_blocked and rate_info.block_until:
            if current_time < rate_info.block_until:
                remaining_time = int(rate_info.block_until - current_time)
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many failed requests. Please try again in {remaining_time} seconds."
                )
            else:
                # Unblock the user
                rate_info.is_blocked = False
                rate_info.block_until = None
                rate_info.failure_count = 0
        
        # Check request rate limiting
        time_since_last_request = current_time - rate_info.last_request_time
        
        if time_since_last_request < self.request_window:
            # Within the rate limiting window
            if rate_info.request_count >= self.max_requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Maximum {self.max_requests_per_minute} requests per minute allowed."
                )
            rate_info.request_count += 1
        else:
            # Reset the counter for new window
            rate_info.request_count = 1
        
        rate_info.last_request_time = current_time
        return True
    
    def record_success(self, key: str):
        """Record a successful request to reset failure count"""
        if key in self.requests:
            self.requests[key].failure_count = 0
            self.requests[key].last_failure_time = None
    
    def record_failure(self, key: str):
        """Record a failed request and potentially block the user"""
        current_time = time.time()
        
        if key not in self.requests:
            self.requests[key] = RateLimitInfo(
                last_request_time=current_time,
                request_count=1,
                failure_count=1,
                last_failure_time=current_time
            )
        else:
            rate_info = self.requests[key]
            rate_info.failure_count += 1
            rate_info.last_failure_time = current_time
            
            # Block user if too many consecutive failures
            if rate_info.failure_count >= self.max_failures_before_block:
                rate_info.is_blocked = True
                rate_info.block_until = current_time + self.failure_block_duration
                print(f"🚫 User {key} blocked for {self.failure_block_duration} seconds due to {rate_info.failure_count} consecutive failures")
    
    def get_remaining_requests(self, key: str) -> int:
        """Get the number of remaining requests for a key"""
        if key not in self.requests:
            return self.max_requests_per_minute
        
        rate_info = self.requests[key]
        current_time = time.time()
        
        if current_time - rate_info.last_request_time >= self.request_window:
            return self.max_requests_per_minute
        
        return max(0, self.max_requests_per_minute - rate_info.request_count)
    
    def cleanup_old_entries(self):
        """Clean up old rate limiting entries to prevent memory leaks"""
        current_time = time.time()
        keys_to_remove = []
        
        for key, rate_info in self.requests.items():
            # Remove entries older than 1 hour
            if current_time - rate_info.last_request_time > 3600:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.requests[key]

# Global rate limiter instance
rate_limiter = RateLimiter()