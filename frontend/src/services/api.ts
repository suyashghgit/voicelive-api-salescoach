/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Assessment, Scenario } from '../types'

function extractUserText(conversationMessages: any[]): string {
  return conversationMessages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' ')
    .trim()
}

export const api = {
  async getConfig() {
    const res = await fetch('/api/config')
    return res.json()
  },

  async getScenarios(): Promise<Scenario[]> {
    const res = await fetch('/api/scenarios')
    return res.json()
  },

  async createAgent(scenarioId: string) {
    const res = await fetch('/api/agents/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId }),
    })
    if (!res.ok) throw new Error('Failed to create agent')
    return res.json()
  },

  async analyzeConversation(
    scenarioId: string,
    transcript: string,
    audioData: any[],
    conversationMessages: any[]
  ): Promise<Assessment> {
    const referenceText = extractUserText(conversationMessages)

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: scenarioId,
        transcript,
        audio_data: audioData,
        reference_text: referenceText,
      }),
    })
    if (!res.ok) throw new Error('Analysis failed')
    return res.json()
  },

  async customizeScenario(
    scenarioId: string,
    resumeContent: string,
    jobDescription: string
  ): Promise<Scenario> {
    const res = await fetch('/api/scenarios/customize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: scenarioId,
        resume_content: resumeContent,
        job_description: jobDescription,
      }),
    })
    if (!res.ok) throw new Error('Failed to customize scenario')
    return res.json()
  },
}
