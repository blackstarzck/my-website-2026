import { describe, expect, it } from 'vitest'
import { NODES } from '../nodes'

describe('/lab 배포 프로젝트', () => {
  it.each([
    ['pokemon', 'https://chanki-pokedx.netlify.app/'],
    ['game-cards', 'https://simple-gatcha.netlify.app/'],
  ])('%s가 독립 페이지와 배포 화면을 가진다', (nodeId, demo) => {
    const node = NODES.find((candidate) => candidate.id === nodeId)

    expect(node?.region).toBe('lab')
    expect(node?.url).toBe(demo)
    expect(node?.repos).toEqual([nodeId])
    expect(node?.project).toBeDefined()
  })

  it('두 프로젝트가 기존 묶음 카드에서 빠진다', () => {
    expect(NODES.find((node) => node.id === 'react-basics')?.cards)
      .not.toContainEqual(expect.objectContaining({ repo: 'pokemon' }))
    expect(NODES.find((node) => node.id === 'game-lab')?.cards)
      .not.toContainEqual(expect.objectContaining({ repo: 'game-cards' }))
  })
})
