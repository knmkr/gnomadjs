#!/usr/bin/env python

import argparse
import hail
from hail.expr import TInt, TDouble, TString
from pprint import pprint
from utils.elasticsearch_client import ElasticsearchClient

p = argparse.ArgumentParser()
p.add_argument("-H", "--host", help="Elasticsearch node host or IP. To look this up, run: `kubectl describe nodes | grep Addresses`", required=True)
p.add_argument("-p", "--port", help="Elasticsearch port", default=9200, type=int)
p.add_argument("-i", "--index", help="Elasticsearch index name", default="coverage")
p.add_argument("-t", "--index-type", help="Elasticsearch index type", default="position")
p.add_argument("-b", "--block-size", help="Elasticsearch block size", default=100, type=int)
p.add_argument("-s", "--num-shards", help="Number of shards", default=1, type=int)
p.add_argument("-f", "--file", help="File path")

# parse args
args = p.parse_args()

hc = hail.HailContext(log="/hail.log") #, branching_factor=1)

FILE_PATH = args.file

kt = hc.import_table(FILE_PATH, impute=True)

print(kt.schema)
print("======== Export exome coverage to elasticsearch ======")

print("======== Export to elasticsearch ======")
es = ElasticsearchClient(
    host=args.host,
    port=args.port,
)

es.export_kt_to_elasticsearch(
    kt,
    index_name=args.index,
    index_type_name=args.index_type,
    num_shards=args.num_shards,
    block_size=args.block_size,
    delete_index_before_exporting=True,
    verbose=True
)
