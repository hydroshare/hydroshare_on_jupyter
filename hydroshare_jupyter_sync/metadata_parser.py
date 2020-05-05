"""
This file is not currently used, but it does contain code that reads from a resource's metadata.xml file.

Extracts metadata from resourcemetadata.xml files (including 'None')
Will error if given other filetype (and won't read directory)

Will need to scrape through and look at problems like (if this is wanted):
* title returns title of xml file, not of resource

"""

from xml.etree import ElementTree
import os

NAMESPACES = {
    'dc': 'http://purl.org/dc/elements/1.1/',
    'dcterms': 'http://purl.org/dc/terms/',
    'hsterms': 'http://hydroshare.org/terms/',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs1': 'http://www.w3.org/2000/01/rdf-schema#',
}


class MetadataParser:

    def __init__(self, file_path):
        self.data = ElementTree.parse(file_path).getroot()

    def get_abstract(self):
        return self._get_elem_value('./rdf:Description/dc:description/rdf:Description/dcterms:abstract')

    def get_creator(self):
        return self._get_elem_value('./rdf:Description/dc:creator/rdf:Description/hsterms:name')

    def get_created_datetime(self):
        return self._get_elem_value('./rdf:Description/dc:date/dcterms:created/rdf:value')

    def get_id(self):
        ident = self.get_resource_url()
        return ident.split('/')[-1] if ident else None

    def get_last_modified_datetime(self):
        return self._get_elem_value('./rdf:Description/dc:date/dcterms:modified/rdf:value')

    def get_resource_url(self):
        return self._get_elem_value('./rdf:Description/dc:identifier/rdf:Description/hsterms:hydroShareIdentifier')

    def get_title(self):
        return self._get_elem_value('./rdf:Description/dc:title')

    def get_public(self):
        return

    def spoof_hs_api_response(self):
        return {
            'resource_id': self.get_id(),
            'author': self.get_creator(),
            'date_last_updated': self.get_last_modified_datetime(),
            'date_created': self.get_created_datetime(),
            'resource_url': self.get_resource_url(),
            'abstract': self.get_abstract(),
            'title': self.get_title(),
        }

    def _get_elem_value(self, path):
        elem = self.data.find(path, NAMESPACES)
        return elem.text if elem is not None else None
