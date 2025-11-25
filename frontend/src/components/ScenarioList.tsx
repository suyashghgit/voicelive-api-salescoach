/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  Button,
  Card,
  CardHeader,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { useState } from 'react'
import { api } from '../services/api'
import { Scenario } from '../types'
import { FileUpload } from './FileUpload'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    width: '100%',
  },
  header: {
    gridColumn: '1 / -1',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingVerticalM,
    gridColumn: '1 / span 2',
    width: '100%',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  card: {
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow16,
    },
  },
  selected: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  actions: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalL,
  },
  loadingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
  },
  graphIcon: {
    fontSize: '24px',
    marginRight: tokens.spacingHorizontalS,
  },
})

interface Props {
  scenarios: Scenario[]
  selectedScenario: string | null
  onSelect: (id: string) => void
  onStart: () => void
  onScenarioGenerated?: (scenario: Scenario) => void
}

export function ScenarioList({
  scenarios,
  selectedScenario,
  onSelect,
  onStart,
  onScenarioGenerated,
}: Props) {
  const styles = useStyles()
  const [loadingGraph, setLoadingGraph] = useState(false)
  const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(
    null
  )
  const [loadingCustomization, setLoadingCustomization] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [resumeContent, setResumeContent] = useState<string>('')
  const [jobDescContent, setJobDescContent] = useState<string>('')

  const handleScenarioClick = async (scenario: Scenario) => {
    if (scenario.is_graph_scenario && !scenario.generated_from_graph) {
      setLoadingGraph(true)
      try {
        const generated = await api.generateGraphScenario()
        const personalizedScenario = {
          ...generated,
          name: 'Personalized Scenario',
          description: generated.description.split('.')[0] + '.',
        }
        setGeneratedScenario(personalizedScenario)
        onScenarioGenerated?.(personalizedScenario)
        onSelect(personalizedScenario.id)
      } catch (error) {
        console.error('Failed to generate Graph scenario:', error)
      } finally {
        setLoadingGraph(false)
      }
    } else if (scenario.id === 'scenario4' && !scenario.generated_from_graph) {
      // Show file upload for the recruiter scenario
      setShowFileUpload(true)
      onSelect(scenario.id)
    } else {
      onSelect(scenario.id)
    }
  }

  const handleTextChange = (resume: string, jobDesc: string) => {
    setResumeContent(resume)
    setJobDescContent(jobDesc)
  }

  const handleCustomizeAndStart = async () => {
    if (!selectedScenario || !resumeContent || !jobDescContent) return

    setLoadingCustomization(true)
    try {
      const customized = await api.customizeScenario(
        selectedScenario,
        resumeContent,
        jobDescContent
      )
      const customizedScenario = {
        ...customized,
        name: 'Suyash Consulting - Interview Role-Play',
        description: 'Personalized interview based on your resume and job description',
        generated_from_graph: true,
      }
      setGeneratedScenario(customizedScenario)
      onScenarioGenerated?.(customizedScenario)
      onSelect(customizedScenario.id)
      setShowFileUpload(false)
      // Trigger start after customization
      setTimeout(() => onStart(), 500)
    } catch (error) {
      console.error('Failed to customize scenario:', error)
    } finally {
      setLoadingCustomization(false)
    }
  }

  // Build the complete scenario list
  const allScenarios = generatedScenario
    ? [...scenarios.filter(s => !s.is_graph_scenario), generatedScenario]
    : scenarios

  return (
    <>
      <Text className={styles.header} size={500} weight="semibold">
        Select Training Scenario
      </Text>
      {showFileUpload && selectedScenario === 'scenario4' && (
        <>
          <FileUpload
            onTextChange={handleTextChange}
            disabled={loadingCustomization}
          />
          <div className={styles.actions}>
            <Button
              appearance="secondary"
              onClick={() => {
                setShowFileUpload(false)
                onSelect('')
              }}
              disabled={loadingCustomization}
            >
              Back
            </Button>
            <Button
              appearance="primary"
              disabled={!resumeContent || !jobDescContent || loadingCustomization}
              onClick={handleCustomizeAndStart}
              size="large"
            >
              {loadingCustomization ? 'Customizing...' : 'Start Interview'}
            </Button>
          </div>
        </>
      )}
      {!showFileUpload && (
        <>
          <div className={styles.cardsGrid}>
            {allScenarios.map(scenario => {
              const isSelected = selectedScenario === scenario.id
              const isGraphLoading =
                scenario.is_graph_scenario &&
                loadingGraph &&
                !scenario.generated_from_graph

              if (isGraphLoading) {
                return (
                  <Card key="graph-loading" className={styles.card}>
                    <div className={styles.loadingCard}>
                      <Spinner size="medium" />
                      <Text size={300}>
                        Analyzing your calendar and generating personalized
                        scenario...
                      </Text>
                    </div>
                  </Card>
                )
              }

              return (
                <Card
                  key={scenario.id}
                  className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleScenarioClick(scenario)}
                >
                  <CardHeader
                    header={
                      <Text weight="semibold">
                        {(scenario.is_graph_scenario ||
                          scenario.generated_from_graph) && (
                          <span className={styles.graphIcon}>✨</span>
                        )}
                        {scenario.name}
                      </Text>
                    }
                    description={<Text size={200}>{scenario.description}</Text>}
                  />
                </Card>
              )
            })}
          </div>
          <div className={styles.actions}>
            <Button
              appearance="primary"
              disabled={!selectedScenario || loadingGraph || selectedScenario === 'scenario4'}
              onClick={onStart}
              size="large"
            >
              Start Training
            </Button>
          </div>
        </>
      )}
    </>
  )
}
