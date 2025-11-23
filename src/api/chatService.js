import request from './request'

/**
 * 发送聊天消息
 * @param {string} message - 用户消息内容
 * @returns {Promise}
 */
export const sendMessage = (message) => {
  return request.post('/chat', {
    query: message,
  })
}

/**
 * 发送流式聊天消息
 * @param {string} message - 用户消息内容
 * @param {Function} onChunk - 处理每个数据块的回调函数
 * @returns {Promise}
 */
export const sendStreamMessage = async (message, onChunk) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

  try {
    const response = await fetch(`${baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      let chunk = decoder.decode(value, { stream: true })
      // 处理可能包含多行的数据
      if (chunk.startsWith('event: meta')) {
        const metastr = chunk.split('\n')[1].replace('data: ', '');
        onChunk('', metastr)
        continue
      }

      if (chunk.includes('event: end')) {
        chunk = chunk.split('event: end')[0]
      }

      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.trim()) {
          // 尝试解析JSON格式的SSE消息
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '')
            if (onChunk) {
              onChunk(jsonStr || '')
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream error:', error)
    throw error
  }
}

/**
 * 获取聊天历史
 * @returns {Promise}
 */
export const getChatHistory = () => {
  return request.get('/chat/history')
}

/**
 * 清空聊天历史
 * @returns {Promise}
 */
export const clearChatHistory = () => {
  return request.post('/chat/clear')
}


export const postRAGMessage = (body) => {
  return request.post('/search/docs', body)
}
