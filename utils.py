def calculate_file_size(bytes_data: bytes) -> float:
    """Calculate file size in megabytes."""
    return len(bytes_data) / (1024 * 1024)
