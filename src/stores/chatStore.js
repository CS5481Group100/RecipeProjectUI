import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const loading = ref(false)

  const addMessage = (message) => {
    messages.value.push({
      id: Date.now(),
      ...message,
      timestamp: new Date(),
    })
  }

  const clearMessages = () => {
    messages.value = []
  }

  const setLoading = (state) => {
    loading.value = state
  }

  return {
    messages,
    loading,
    addMessage,
    clearMessages,
    setLoading,
  }
})
