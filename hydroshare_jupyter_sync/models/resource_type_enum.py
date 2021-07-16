from enum import Enum


class ResourceTypeEnum(Enum):
    GenericResource = "GenericResource"
    RasterResource = "RasterResource"
    RefTimeSeriesResource = "RefTimeSeriesResource"
    TimeSeriesResource = "TimeSeriesResource"
    NetcdfResource = "NetcdfResource"
    ModelProgramResource = "ModelProgramResource"
    ModelInstanceResource = "ModelInstanceResource"
    ToolResource = "ToolResource"
    SWATModelInstanceResource = "SWATModelInstanceResource"
    GeographicFeatureResource = "GeographicFeatureResource"
    ScriptResource = "ScriptResource"
    CollectionResource = "CollectionResource"
    MODFLOWModelInstanceResource = "MODFLOWModelInstanceResource"
    CompositeResource = "CompositeResource"
