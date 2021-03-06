import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'

export const SearchResultType = new GraphQLObjectType({
  name: 'SearchResult',
  fields: {
    label: { type: new GraphQLNonNull(GraphQLString) },
    url: { type: new GraphQLNonNull(GraphQLString) },
  },
})

const REGION_ID_REGEX = /^(chr)?(\d+|x|y|m|mt)[-:]([0-9]+)([-:]([0-9]+)?)?$/i

export const isRegionId = str => {
  const match = REGION_ID_REGEX.exec(str)
  if (!match) {
    return false
  }

  const chrom = match[2].toLowerCase()
  const chromNumber = Number(chrom)
  if (!isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    return false
  }

  const start = match[3]
  const end = match[5]

  if (end && end < start) {
    return false
  }

  return true
}

const VARIANT_ID_REGEX = /^(chr)?(\d+|x|y|m|mt)[-:]([0-9]+)([-:]([acgt]+)?([-:]([acgt]+)?)?)?$/i

export const isVariantId = str => {
  const match = VARIANT_ID_REGEX.exec(str)
  if (!match) {
    return false
  }

  const chrom = match[2].toLowerCase()
  const chromNumber = Number(chrom)
  if (!isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    return false
  }

  return true
}

export const resolveSearchResults = async (ctx, query) => {
  const upperCaseQuery = query.toUpperCase()

  if (isVariantId(query)) {
    return [
      {
        label: upperCaseQuery,
        url: `/variant/${upperCaseQuery}`,
      },
    ]
  }

  if (isRegionId(query)) {
    return [
      {
        label: upperCaseQuery,
        url: `/region/${upperCaseQuery}`,
      },
    ]
  }

  const startsWithQuery = { $regex: `^${upperCaseQuery}` }
  const matchingGenes = await ctx.database.gnomad
    .collection('genes')
    .find({
      $or: [{ gene_name_upper: startsWithQuery }, { other_names: startsWithQuery }],
    })
    .limit(5)
    .toArray()

  const geneNameCounts = {}
  matchingGenes.forEach(gene => {
    if (geneNameCounts[gene.gene_name_upper] === undefined) {
      geneNameCounts[gene.gene_name_upper] = 0
    }
    geneNameCounts[gene.gene_name_upper] += 1
  })

  return matchingGenes.map(gene => ({
    label:
      geneNameCounts[gene.gene_name_upper] > 1
        ? `${gene.gene_name_upper} (${gene.gene_id})`
        : gene.gene_name_upper,
    url: `/gene/${gene.gene_id}`,
  }))
}
