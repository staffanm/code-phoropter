#!/usr/bin/env python3
"""
Advanced data processing pipeline with type hints and async support.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Union, TypeVar, Generic, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import json

T = TypeVar('T')

@dataclass
class ProcessingResult(Generic[T]):
    """Result of a data processing operation."""
    data: T
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Union[str, int, float]] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    
    @property
    def is_success(self) -> bool:
        return len(self.errors) == 0
    
    def add_error(self, error: str) -> None:
        self.errors.append(f"{datetime.now().isoformat()}: {error}")

class DataProcessor:
    """Asynchronous data processor with validation and error handling."""
    
    def __init__(self, config_path: Optional[Path] = None) -> None:
        self.config = self._load_config(config_path)
        self.logger = self._setup_logging()
        self._processors: Dict[str, Callable] = {}
        
    def _load_config(self, config_path: Optional[Path]) -> Dict[str, any]:
        """Load configuration from file or use defaults."""
        if config_path and config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        return {
            'batch_size': 1000,
            'timeout': 30.0,
            'retry_attempts': 3,
            'output_format': 'json'
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Configure logging for the processor."""
        logger = logging.getLogger(self.__class__.__name__)
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def register_processor(self, name: str, func: Callable) -> None:
        """Register a custom processing function."""
        if not callable(func):
            raise ValueError(f"Processor {name} must be callable")
        self._processors[name] = func
        self.logger.info(f"Registered processor: {name}")
    
    async def process_batch(
        self, 
        data: List[T], 
        processor_name: str = 'default'
    ) -> ProcessingResult[List[T]]:
        """Process a batch of data asynchronously."""
        result = ProcessingResult(data=[])
        
        try:
            if processor_name not in self._processors:
                result.add_error(f"Unknown processor: {processor_name}")
                return result
            
            processor = self._processors[processor_name]
            
            # Process items in batches
            batch_size = self.config['batch_size']
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                
                try:
                    processed_batch = await asyncio.wait_for(
                        self._process_items(batch, processor),
                        timeout=self.config['timeout']
                    )
                    result.data.extend(processed_batch)
                    
                except asyncio.TimeoutError:
                    result.add_error(f"Timeout processing batch {i//batch_size + 1}")
                except Exception as e:
                    result.add_error(f"Error in batch {i//batch_size + 1}: {str(e)}")
            
            result.metadata = {
                'total_items': len(data),
                'processed_items': len(result.data),
                'batch_count': (len(data) + batch_size - 1) // batch_size,
                'processor': processor_name
            }
            
        except Exception as e:
            result.add_error(f"Fatal error: {str(e)}")
            self.logger.error(f"Processing failed: {e}", exc_info=True)
        
        return result
    
    async def _process_items(self, items: List[T], processor: Callable) -> List[T]:
        """Process individual items with retry logic."""
        tasks = []
        for item in items:
            task = self._process_with_retry(item, processor)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and return successful results
        return [r for r in results if not isinstance(r, Exception)]
    
    async def _process_with_retry(self, item: T, processor: Callable) -> T:
        """Process single item with retry logic."""
        attempts = self.config['retry_attempts']
        
        for attempt in range(attempts):
            try:
                if asyncio.iscoroutinefunction(processor):
                    return await processor(item)
                else:
                    return processor(item)
                    
            except Exception as e:
                if attempt == attempts - 1:
                    self.logger.warning(f"Failed after {attempts} attempts: {e}")
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

# Example usage
async def main():
    processor = DataProcessor()
    
    # Register a simple processor
    def square_processor(x: int) -> int:
        if not isinstance(x, (int, float)):
            raise ValueError("Input must be numeric")
        return x ** 2
    
    processor.register_processor('square', square_processor)
    
    # Process some data
    data = list(range(1, 101))
    result = await processor.process_batch(data, 'square')
    
    if result.is_success:
        print(f"Successfully processed {len(result.data)} items")
        print(f"Sample results: {result.data[:10]}")
    else:
        print(f"Processing completed with {len(result.errors)} errors")
        for error in result.errors:
            print(f"  - {error}")

if __name__ == "__main__":
    asyncio.run(main())