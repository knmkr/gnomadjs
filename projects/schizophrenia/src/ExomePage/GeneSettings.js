import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect } from 'react-redux'

import {
  actions as variantActions,
  selectedVariantDataset,
  variantDeNovoFilter,
  variantFilter,
} from '@broad/redux-variants'

import { currentGene, geneData, exonPadding } from '@broad/redux-genes'

import {
  MaterialButtonRaised,
  SettingsContainer,
  MenusContainer,
  Search,
  SearchContainer,
  DataSelectionGroup,
} from '@broad/ui'

const VariantCategoryButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
`

const VariantCategoryButton = MaterialButtonRaised.extend`
  margin-right: 10px;
  background-color: ${({ isActive }) =>
    isActive ? 'rgba(10, 121, 191, 0.3)' : 'rgba(10, 121, 191, 0.1)'};

  &:hover {
    background-color: rgba(10, 121, 191, 0.3);
  }

  &:active {
    background-color: rgba(10, 121, 191, 0.5);
  }
`

const GeneSettings = ({
  searchVariants,
  setVariantFilter,
  toggleVariantDeNovoFilter,
  variantDeNovoFilter,
  variantFilter,
}) => {
  const variantCategoryButtonGroup = (
    <VariantCategoryButtonGroup>
      <VariantCategoryButton
        isActive={
          variantFilter.lof &&
          variantFilter.missense &&
          variantFilter.synonymous &&
          variantFilter.other
        }
        onClick={() =>
          setVariantFilter({
            lof: true,
            missense: true,
            synonymous: true,
            other: true,
          })
        }
      >
        All
      </VariantCategoryButton>
      <VariantCategoryButton
        isActive={
          variantFilter.lof &&
          variantFilter.missense &&
          !variantFilter.synonymous &&
          !variantFilter.other
        }
        onClick={() =>
          setVariantFilter({
            lof: true,
            missense: true,
            synonymous: false,
            other: false,
          })
        }
      >
        Missense + LoF
      </VariantCategoryButton>
      <VariantCategoryButton
        isActive={
          variantFilter.lof &&
          !variantFilter.missense &&
          !variantFilter.synonymous &&
          !variantFilter.other
        }
        onClick={() =>
          setVariantFilter({
            lof: true,
            missense: false,
            synonymous: false,
            other: false,
          })
        }
      >
        LoF
      </VariantCategoryButton>
      <VariantCategoryButton isActive={variantDeNovoFilter} onClick={toggleVariantDeNovoFilter}>
        De novo
      </VariantCategoryButton>
    </VariantCategoryButtonGroup>
  )

  return (
    <SettingsContainer>
      <MenusContainer>
        <DataSelectionGroup>{variantCategoryButtonGroup}</DataSelectionGroup>
        <DataSelectionGroup>
          <SearchContainer>
            <Search
              placeholder={'Search variant table'}
              onChange={searchVariants}
              withKeyboardShortcuts
            />
          </SearchContainer>
        </DataSelectionGroup>
      </MenusContainer>
    </SettingsContainer>
  )
}

GeneSettings.propTypes = {
  searchVariants: PropTypes.func.isRequired,
  setVariantFilter: PropTypes.func.isRequired,
  toggleVariantDeNovoFilter: PropTypes.func.isRequired,
  variantDeNovoFilter: PropTypes.bool.isRequired,
  variantFilter: PropTypes.shape({
    lof: PropTypes.bool.isRequired,
    missense: PropTypes.bool.isRequired,
    synonymous: PropTypes.bool.isRequired,
    other: PropTypes.bool.isRequired,
  }).isRequired,
}

const mapStateToProps = (state) => {
  return {
    currentGene: currentGene(state),
    exonPadding: exonPadding(state),
    selectedVariantDataset: selectedVariantDataset(state),
    geneData: geneData(state),
    variantDeNovoFilter: variantDeNovoFilter(state),
    variantFilter: variantFilter(state),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setVariantFilter: filter => dispatch(variantActions.setVariantFilter(filter)),
    searchVariants: searchText => dispatch(variantActions.searchVariants(searchText)),
    toggleVariantDeNovoFilter: () => dispatch(variantActions.toggleVariantDeNovoFilter()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneSettings)
