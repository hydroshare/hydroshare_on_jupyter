from enum import Enum, auto
from hsclient import Resource
from .resource_strategies import (
    HydroShareFileDownloadStrategy,
    HydroShareFolderDownloadStrategy,
)


class InvalidEntityTypeException(Exception):
    """Invalid EntityTypeEnum Exception"""

    def __init__(self, o: object) -> None:
        message = f"{o} is not a EntityTypeEnum member"
        super().__init__(message)


class EntityTypeEnum(Enum):
    FILE = auto()
    FOLDER = auto()


class HydroShareEntityDownloadFactory:
    _CHOICES = {
        EntityTypeEnum.FILE: HydroShareFileDownloadStrategy,
        EntityTypeEnum.FOLDER: HydroShareFolderDownloadStrategy,
    }

    @staticmethod
    def download(
        entity_type: EntityTypeEnum,
        resource: Resource,
        data_path: str,
        path: str,
    ):
        cls = HydroShareEntityDownloadFactory._CHOICES.get(entity_type, None)
        if cls is None:
            raise InvalidEntityTypeException(entity_type)

        downloader = cls(resource, data_path)
        return downloader.download(path)
