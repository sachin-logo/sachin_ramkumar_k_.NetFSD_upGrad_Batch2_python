

import functools
import time
import logging


def log_call(func):
    """Decorator that logs when a function is called and when it completes."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logging.info(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        logging.info(f"{func.__name__} completed")
        return result
    return wrapper


def retry(times=3, delay=1):
    """Decorator that retries a function up to `times` attempts on exception."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logging.warning(f"Attempt {attempt}/{times} failed for {func.__name__}: {e}")
                    if attempt == times:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator
