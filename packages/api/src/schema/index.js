import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'

import { getXpos } from '../utilities/variant'

import { AggregateQualityMetricsType } from './datasets/aggregateQualityMetrics'

import geneType, {
  lookupGeneByGeneId,
  lookupGeneByName,
} from './types/gene'

import transcriptType, {
  lookupTranscriptsByTranscriptId,
} from './types/transcript'

import regionType from './types/region'

import { gnomadVariants } from './types/elasticVariant'

import help from './types/help'
import { SearchResultType, resolveSearchResults } from './types/search'
import { VariantInterface } from './types/variant'

import { datasetArgumentTypeForMethod } from './datasets/datasetArgumentTypes'
import datasetsConfig, { datasetSpecificTypes } from './datasets/datasetsConfig'

const rootType = new GraphQLObjectType({
  name: 'Root',
  description: `
The fields below allow for different ways to look up gnomAD data. Click on the the Gene, Variant, or Region types to see more information.
  `,
  fields: () => ({
    aggregateQualityMetrics: {
      type: AggregateQualityMetricsType,
      args: {
        dataset: { type: datasetArgumentTypeForMethod('fetchAggregateQualityMetrics') },
      },
      resolve: (obj, args, ctx) => {
        const fetchAggregateQualityMetrics =
          datasetsConfig[args.dataset].fetchAggregateQualityMetrics
        return fetchAggregateQualityMetrics(ctx)
      },
    },
    gene: {
      description: 'Look up variant data by gene name. Example: PCSK9.',
      type: geneType,
      args: {
        gene_name: { type: GraphQLString },
        gene_id: { type: GraphQLString },
        filter: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        if (args.gene_name) {
          return lookupGeneByName(ctx.database.gnomad, args.gene_name)
        }
        if (args.gene_id) {
          return lookupGeneByGeneId(ctx.database.gnomad, args.gene_id)
        }
        return 'No lookup found'
      },
    },
    transcript: {
      description: 'Look up variant data by transcript ID. Example: ENST00000407236.',
      type: transcriptType,
      args: {
        transcript_id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args, ctx) => {
        return lookupTranscriptsByTranscriptId(ctx.database.gnomad, args.transcript_id)
      },
    },
    region: {
      description: 'Look up data by start/stop. Example: (start: 55505222, stop: 55505300, chrom: 1).',
      type: regionType,
      args: {
        start: { type: new GraphQLNonNull(GraphQLFloat) },
        stop: { type: new GraphQLNonNull(GraphQLFloat) },
        chrom: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args) => ({
        start: args.start,
        stop: args.stop,
        chrom: args.chrom,
        xstart: getXpos(args.chrom, args.start),
        xstop: getXpos(args.chrom, args.stop),
        regionSize: args.stop - args.start,
      }),
    },
    searchResults: {
      type: new GraphQLList(SearchResultType),
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args, ctx) => resolveSearchResults(ctx, args.query),
    },
    variant: {
      description: 'Look up a single variant or rsid. Example: 1-55516888-G-GA.',
      type: VariantInterface,
      args: {
        dataset: { type: datasetArgumentTypeForMethod('fetchVariantDetails') },
        variantId: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        const { dataset, variantId } = args
        const fetchVariantDetails = datasetsConfig[dataset].fetchVariantDetails
        return fetchVariantDetails(ctx, variantId)
      },
    },
    gnomadVariants,
    help,
  }),
})

const Schema = new GraphQLSchema({
  query: rootType,
  types: datasetSpecificTypes,
})

export default Schema
