from abc import ABC, abstractmethod
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from hsclient import Resource
from zipfile import ZipFile


class AbstractHydroShareEntityDownloadStrategy(ABC):
    def __init__(self, resource: Resource, data_path: str):
        self.resource = resource
        self.data_path = data_path

    @abstractmethod
    def download(self, path: str):
        """Interface for HydroShare file system entity download"""

    def create_intermediary_directories(self, path: Path) -> Path:
        """Handles the creation of {data_path}/{resource_id}/{resource_id}/data/contents"""
        contents_path = (
            Path(self.data_path) / self.resource.resource_id / self.resource.resource_id / "data/contents" / path
        )
        contents_path.mkdir(parents=True, exist_ok=True)
        return contents_path


# Concrete strategies


class HydroShareFileDownloadStrategy(AbstractHydroShareEntityDownloadStrategy):
    def download(self, path: str):
        """Download file from HydroShare and move to {data_path}/{resource_id}/data/contents"""

        with TemporaryDirectory() as temp_dir:
            downloaded_file = self.resource.file_download(
                path, save_path=temp_dir, zipped=False
            )
            path = Path(path)
            fn = path.name
            parent_dir = path.parent
            contents_path = self.create_intermediary_directories(parent_dir)

            shutil.move(downloaded_file, contents_path / fn)


class HydroShareFolderDownloadStrategy(AbstractHydroShareEntityDownloadStrategy):
    def download(self, path: str):
        """Download folder from HydroShare"""

        with TemporaryDirectory() as temp_dir:
            downloaded_folder = self.resource.folder_download(path, save_path=temp_dir)
            parent_dir = Path(path).parent
            contents_path = self.create_intermediary_directories(parent_dir)

            # unzip resource
            with ZipFile(downloaded_folder, "r") as zr:
                zr.extractall(contents_path / parent_dir)
