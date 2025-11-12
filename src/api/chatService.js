import request from './request'

/**
 * 发送聊天消息
 * @param {string} message - 用户消息内容
 * @returns {Promise}
 */
export const sendMessage = (message) => {
  return request.post('/chat/send', {
    message,
  })
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
