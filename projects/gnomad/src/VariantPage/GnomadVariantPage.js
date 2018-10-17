import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { Page, SectionHeading } from '@broad/ui'

import GnomadPageHeading from '../GnomadPageHeading'
import Link from '../Link'
import StatusMessage from '../StatusMessage'
import { ReferenceList } from './ReferenceList'
import GnomadAgeDistribution from './GnomadAgeDistribution'
import { GnomadPopulationsTable } from './GnomadPopulationsTable'
import { GnomadGenotypeQualityMetrics } from './qualityMetrics/GnomadGenotypeQualityMetrics'
import { GnomadSiteQualityMetrics } from './qualityMetrics/GnomadSiteQualityMetrics'
import { GnomadReadData } from './reads/GnomadReadData'
import { TranscriptConsequenceList } from './TranscriptConsequenceList'
import { VariantDetailsQuery } from './VariantDetailsQuery'
import { GnomadVariantOccurrenceTable } from './VariantOccurrenceTable'

const Section = styled.section`
  width: 100%;
  margin-bottom: 2em;
`

const ResponsiveSection = Section.extend`
  width: calc(50% - 15px);

  @media (max-width: 992px) {
    width: 100%;
  }
`

const VariantDetailsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`

const variantPageDatasets = [
  'gnomad_r2_1',
  'gnomad_r2_1_controls',
  'gnomad_r2_1_non_cancer',
  'gnomad_r2_1_non_neuro',
  'gnomad_r2_1_non_topmed',
]

const GnomadVariantPage = ({ datasetId, variantId }) => (
  <Page>
    <GnomadPageHeading datasetOptions={variantPageDatasets} selectedDataset={datasetId}>
      Variant: {variantId}
    </GnomadPageHeading>
    <VariantDetailsQuery datasetId={datasetId} variantId={variantId}>
      {({ data, error, loading }) => {
        if (loading) {
          return <StatusMessage>Loading variant...</StatusMessage>
        }

        if (error) {
          return <StatusMessage>Unable to load variant</StatusMessage>
        }

        if (!data.variant) {
          return <StatusMessage>Variant not found</StatusMessage>
        }

        const variant = data.variant

        const numTranscripts = variant.sortedTranscriptConsequences.length
        const geneIds = variant.sortedTranscriptConsequences.map(csq => csq.gene_id)
        const numGenes = new Set(geneIds).size

        return (
          <VariantDetailsContainer>
            <ResponsiveSection>
              <GnomadVariantOccurrenceTable variant={variant} />

              {variant.colocatedVariants.length > 0 && (
                <div>
                  <p>
                    <strong>This variant is multiallelic. Other alt alleles are:</strong>
                  </p>
                  <ul>
                    {variant.colocatedVariants.map(variantId => (
                      <li key={variantId}>
                        <Link to={`/variant/${variantId}`}>{variantId}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ResponsiveSection>
            <ResponsiveSection>
              <SectionHeading>References</SectionHeading>
              <ReferenceList variant={variant} />
            </ResponsiveSection>
            <Section>
              <SectionHeading>Annotations</SectionHeading>
              <p>
                This variant falls on {numTranscripts} transcript(s) in {numGenes} gene(s).
              </p>
              <TranscriptConsequenceList
                sortedTranscriptConsequences={variant.sortedTranscriptConsequences}
              />
            </Section>
            <ResponsiveSection>
              <SectionHeading>Population Frequencies</SectionHeading>
              <GnomadPopulationsTable
                exomePopulations={variant.exome ? variant.exome.populations : []}
                genomePopulations={variant.genome ? variant.genome.populations : []}
                showHemizygotes={variant.chrom === 'X' || variant.chrom === 'Y'}
              />
            </ResponsiveSection>
            <ResponsiveSection>
              <SectionHeading>Age Distribution</SectionHeading>
              <GnomadAgeDistribution variant={variant} />
            </ResponsiveSection>
            <ResponsiveSection>
              <SectionHeading>Genotype Quality Metrics</SectionHeading>
              <GnomadGenotypeQualityMetrics variant={variant} />
            </ResponsiveSection>
            <ResponsiveSection>
              <SectionHeading>Site Quality Metrics</SectionHeading>
              <GnomadSiteQualityMetrics datasetId={datasetId} variant={variant} />
            </ResponsiveSection>
            <Section>
              <SectionHeading>Read Data</SectionHeading>
              <GnomadReadData variant={variant} />
            </Section>
          </VariantDetailsContainer>
        )
      }}
    </VariantDetailsQuery>
  </Page>
)

GnomadVariantPage.propTypes = {
  datasetId: PropTypes.string.isRequired,
  variantId: PropTypes.string.isRequired,
}

export default GnomadVariantPage
