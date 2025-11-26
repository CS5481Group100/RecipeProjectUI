<template>
  <div class="chat-message" :class="message.role">
    <div class="message-avatar">
      <a-avatar
        :size="40"
        :style="{
          backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a',
        }"
        :icon="message.role === 'user' ? h(UserOutlined) : h(RobotOutlined)"
      />
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ message.role === 'user' ? 'You' : 'Recipe Agent' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-text-wrapper">
        <div class="message-text">{{ message.content }}</div>

        <!-- 工具栏：仅在悬停时显示（针对 AI 回答） -->
        <div
          class="message-toolbar"
          v-show="message.role !== 'user'"
        >
          <a-space>
            <a-tooltip title="Copy">
              <a-button type="text" size="small" @click="handleCopy">
                <CopyOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="View Detail">
              <a-button type="text" size="small" @click="drawerVisible = true">
                <EyeOutlined />
              </a-button>
            </a-tooltip>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 右侧抽屉：显示 message.meta 或完整内容 -->
    <a-drawer v-model:visible="drawerVisible" placement="right" width="60%" :closable="true">
      <h3>Message Details</h3>
      <div style="margin-top: 12px;">
        <strong>Content: </strong>
        <pre style="white-space: pre-wrap; word-break: break-word; background:#f7f7f7; padding:8px; border-radius:4px;">{{ message.content }}</pre>
      </div>

      <div style="margin-top: 12px;">
        <strong>Meta Data: </strong>

        <div v-if="isMetaObject">
          <div style="margin-top:8px">
            <a-row align="middle">
              <a-col :span="6"><strong>Model</strong></a-col>
              <a-col :span="18">{{ parsedMeta.model || '-' }}</a-col>
            </a-row>
          </div>

          <div v-if="parsedMeta.documents && parsedMeta.documents.length" style="margin-top:12px">
            <a-collapse>
              <a-collapse-panel v-for="(doc, idx) in parsedMeta.documents" :key="doc.id || idx" :header="doc.title || ('Document ' + (idx+1))">
                <a-row style="margin-bottom:8px">
                  <a-col :span="8"><strong>id</strong></a-col>
                  <a-col :span="16">{{ doc.id || '-' }}</a-col>
                </a-row>
                <a-row style="margin-bottom:8px">
                  <a-col :span="8"><strong>score</strong></a-col>
                  <a-col :span="16">{{ doc.score }}</a-col>
                </a-row>
                <a-row style="margin-bottom:8px">
                  <a-col :span="8"><strong>chunk_id</strong></a-col>
                  <a-col :span="16">{{ doc.chunk_id || '-' }}</a-col>
                </a-row>
                <a-row style="margin-bottom:8px">
                  <a-col :span="8"><strong>chunk_type</strong></a-col>
                  <a-col :span="16">{{ doc.chunk_type || '-' }}</a-col>
                </a-row>
                <a-row style="margin-bottom:8px">
                  <a-col :span="8"><strong>origin_id</strong></a-col>
                  <a-col :span="16">{{ doc.origin_id || '-' }}</a-col>
                </a-row>

                <div style="margin-top:8px">
                  <strong>source_text</strong>
                  <div style="margin-top:6px">
                    <pre v-if="isJsonString(doc.source_text)" style="white-space: pre-wrap; word-break: break-word; background:#f7f7f7; padding:8px; border-radius:4px;">{{ formatJsonString(doc.source_text) }}</pre>
                    <pre v-else style="white-space: pre-wrap; word-break: break-word; background:#f7f7f7; padding:8px; border-radius:4px;">{{ doc.source_text }}</pre>
                  </div>
                </div>

                <div v-if="doc.source" style="margin-top:12px">
                  <strong>source object</strong>
                  <pre style="white-space: pre-wrap; word-break: break-word; background:#fafafa; padding:8px; border-radius:4px;">{{ stringify(doc.source) }}</pre>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>

          <div v-else style="margin-top:8px">
            <em>No documents in meta</em>
          </div>
        </div>

        <div v-else style="margin-top:8px">
          <pre style="white-space: pre-wrap; word-break: break-word; background:#f7f7f7; padding:8px; border-radius:4px;">{{ formattedMeta }}</pre>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { h, ref, computed } from 'vue'
import { message as antdMessage } from 'ant-design-vue'
import { UserOutlined, RobotOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
    validator: (msg) => msg.role && msg.content !== undefined,
  },
})

const drawerVisible = ref(false)

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content || '')
    antdMessage.success('已复制到剪贴板')
  } catch (e) {
    antdMessage.error('复制失败')
  }
}

const formattedMeta = computed(() => {
  const meta = props.message.meta
  if (!meta) return 'No meta data'
  try {
    return typeof meta === 'string' ? meta : JSON.stringify(meta, null, 2)
  } catch (e) {
    return String(meta)
  }
})

const parsedMeta = computed(() => {
  const meta = props.message.meta
  if (!meta) return null
  if (typeof meta === 'object') return meta
  try {
    return JSON.parse(meta)
  } catch (e) {
    return null
  }
})

const isMetaObject = computed(() => parsedMeta.value && typeof parsedMeta.value === 'object')

function isJsonString(s) {
  if (!s || typeof s !== 'string') return false
  s = s.trim()
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try {
      JSON.parse(s)
      return true
    } catch (e) {
      return false
    }
  }
  return false
}

function formatJsonString(s) {
  try {
    const obj = JSON.parse(s)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return s
  }
}

function stringify(obj) {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return String(obj)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.chat-message.user .message-content {
  align-items: flex-end;
}

.message-header {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.chat-message.user .message-header {
  flex-direction: row-reverse;
}

.message-role {
  font-weight: 500;
}

.message-time {
  font-size: 11px;
}

.message-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-text {
  background-color: #f5f5f5;
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-word;
  max-width: 500px;
  line-height: 1.5;
}

.chat-message.user .message-text {
  background-color: #1890ff;
  color: white;
}

/* 工具栏：初始隐藏，父元素 hover 时显示 */
.message-toolbar {
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  max-width: 500px;
  display: flex;
  flex-direction: row-reverse;
}

.chat-message:hover .message-toolbar {
  opacity: 1;
  transform: translateY(0);
}

</style>
