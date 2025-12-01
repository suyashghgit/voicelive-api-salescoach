/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  Button,
  Card,
  Text,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { useState } from 'react'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    width: '100%',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
    '@media (max-width: 800px)': {
      gridTemplateColumns: '1fr',
    },
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  textarea: {
    minHeight: '180px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
  helper: {
    color: tokens.colorNeutralForeground3,
  },
})

interface Props {
  onTextChange: (resume: string, jobDescription: string) => void
  disabled?: boolean
}

export function FileUpload({ onTextChange, disabled }: Props) {
  const styles = useStyles()
  const [resumeContent, setResumeContent] = useState('')
  const [jobDescContent, setJobDescContent] = useState('')

  const handleResumeChange = (v: string) => {
    setResumeContent(v)
    onTextChange(v, jobDescContent)
  }

  const handleJobDescChange = (v: string) => {
    setJobDescContent(v)
    onTextChange(resumeContent, v)
  }

  const clearAll = () => {
    setResumeContent('')
    setJobDescContent('')
    onTextChange('', '')
  }

  return (
    <Card className={styles.container}>
      <Text size={400} weight="semibold">
        Paste Resume & Job Description
      </Text>
      <Text size={200} className={styles.helper}>
        Paste plain text only. Remove any confidential or unwanted sections before proceeding.
      </Text>
      <div className={styles.grid}>
        <div className={styles.section}>
          <Text size={300} weight="semibold">
            Candidate Resume
          </Text>
          <Textarea
            value={resumeContent}
            onChange={(_, data) => handleResumeChange(data.value)}
            className={styles.textarea}
            disabled={disabled}
            placeholder="Paste candidate resume text here..."
          />
          <Text size={200} className={styles.helper}>
            {resumeContent.length === 0
              ? 'Required'
              : `${resumeContent.length} characters`}
          </Text>
        </div>
        <div className={styles.section}>
          <Text size={300} weight="semibold">
            Job Description
          </Text>
          <Textarea
            value={jobDescContent}
            onChange={(_, data) => handleJobDescChange(data.value)}
            className={styles.textarea}
            disabled={disabled}
            placeholder="Paste job description text here..."
          />
          <Text size={200} className={styles.helper}>
            {jobDescContent.length === 0
              ? 'Required'
              : `${jobDescContent.length} characters`}
          </Text>
        </div>
      </div>
      <div className={styles.actions}>
        <Button appearance="secondary" onClick={clearAll} disabled={disabled}>
          Clear
        </Button>
        <Button
          appearance="primary"
          disabled={
            disabled || resumeContent.trim().length < 30 || jobDescContent.trim().length < 30
          }
        >
          Text Ready
        </Button>
      </div>
    </Card>
  )
}
