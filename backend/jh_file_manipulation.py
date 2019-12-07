import os

# Pretend JH root directory (can use os.environ['JUPYTER_DOWNLOADS'] as real root)
JH_dir = r'tests/hs_resources'

def rename_file(old_name, new_name):
    # front end should have the old name/location from get_files_in_JH_with_metadata