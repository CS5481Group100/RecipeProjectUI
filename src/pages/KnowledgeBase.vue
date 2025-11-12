<template>
  <div class="knowledge-base-view">
    <!-- 操作栏 -->
    <div class="action-bar">
      <a-space>
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          新增知识
        </a-button>
        <a-button @click="handleRefresh">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
      </a-space>
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索知识库..."
        style="width: 250px"
        @search="handleSearch"
      />
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 800 }"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'tags'">
          <a-tag v-for="tag in record.tags" :key="tag" color="blue">
            {{ tag }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-badge
            :status="record.status === '已发布' ? 'success' : 'processing'"
            :text="record.status"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="删除知识"
              description="确定要删除这条知识吗？"
              @confirm="handleDelete(record.id)"
              ok-text="确定"
              cancel-text="取消"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:visible="showAddModal"
      title="新增知识"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveKnowledge"
      width="600px"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="知识名称" required>
          <a-input v-model:value="formData.name" placeholder="输入知识名称" />
        </a-form-item>
        <a-form-item label="知识描述">
          <a-textarea
            v-model:value="formData.description"
            placeholder="输入知识描述"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="知识分类" required>
          <a-select
            v-model:value="formData.category"
            placeholder="选择分类"
            :options="categoryOptions"
          />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="formData.tags"
            mode="tags"
            placeholder="输入标签并按回车确认"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'

// 状态管理
const loading = ref(false)
const showAddModal = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 分类选项
const categoryOptions = [
  { label: '食材', value: 'ingredient' },
  { label: '烹饪技巧', value: 'cooking' },
  { label: '食谱', value: 'recipe' },
  { label: '营养知识', value: 'nutrition' },
]

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '番茄红素的健康益处',
    description: '番茄红素是一种强大的抗氧化剂，具有多种健康益处，包括心脏病预防和抗癌作用。',
    category: 'nutrition',
    categoryLabel: '营养知识',
    tags: ['番茄', '抗氧化', '营养'],
    status: '已发布',
    createTime: '2025-11-10 14:30',
    updateTime: '2025-11-11 09:15',
  },
  {
    id: 2,
    name: '高火快炒技巧',
    description: '掌握高火快炒的要点，能够快速烹饪出美味的菜肴，保留食材的营养价值。',
    category: 'cooking',
    categoryLabel: '烹饪技巧',
    tags: ['火候', '快炒', '技巧'],
    status: '已发布',
    createTime: '2025-11-09 10:20',
    updateTime: '2025-11-10 15:45',
  },
  {
    id: 3,
    name: '有机鸡蛋的选择',
    description: '如何识别和选择真正的有机鸡蛋，避免被误导。',
    category: 'ingredient',
    categoryLabel: '食材',
    tags: ['鸡蛋', '有机', '采购'],
    status: '已发布',
    createTime: '2025-11-08 13:00',
    updateTime: '2025-11-08 13:00',
  },
  {
    id: 4,
    name: '宫保鸡丁食谱',
    description: '经典川菜宫保鸡丁的详细做法，配方和烹饪步骤。',
    category: 'recipe',
    categoryLabel: '食谱',
    tags: ['宫保鸡丁', '川菜', '食谱'],
    status: '已发布',
    createTime: '2025-11-07 11:30',
    updateTime: '2025-11-07 11:30',
  },
  {
    id: 5,
    name: '低温烹饪原理',
    description: '了解低温烹饪如何保持食物的嫩度和风味。',
    category: 'cooking',
    categoryLabel: '烹饪技巧',
    tags: ['低温', '原理', '科学'],
    status: '已发布',
    createTime: '2025-11-06 09:45',
    updateTime: '2025-11-06 09:45',
  },
  {
    id: 6,
    name: '新增知识示例',
    description: '这是一个新增的知识示例',
    category: 'nutrition',
    categoryLabel: '营养知识',
    tags: ['示例', '新增'],
    status: '未发布',
    createTime: '2025-11-11 16:00',
    updateTime: '2025-11-11 16:00',
  },
]

// 数据源
const knowledgeBase = ref([...mockData])

// 表格数据
const tableData = computed(() => {
  let result = knowledgeBase.value

  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword))
    )
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 表格列定义
const columns = [
  {
    title: '知识名称',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'categoryLabel',
    key: 'category',
    width: 100,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
]

// 分页配置
const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: knowledgeBase.value.length,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total) => `共 ${total} 条记录`,
}))

// 表单数据
const formData = ref({
  name: '',
  description: '',
  category: undefined,
  tags: [],
})

// 处理表格变化
const handleTableChange = (pag, filters, sorter) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
}

// 处理刷新
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('已刷新数据')
  }, 500)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理编辑
const handleEdit = (record) => {
  formData.value = {
    ...record,
    tags: record.tags || [],
  }
  showAddModal.value = true
}

// 处理删除
const handleDelete = (id) => {
  knowledgeBase.value = knowledgeBase.value.filter((item) => item.id !== id)
  message.success('删除成功')
}

// 处理保存
const handleSaveKnowledge = () => {
  if (!formData.value.name) {
    message.error('请输入知识名称')
    return
  }
  if (!formData.value.category) {
    message.error('请选择分类')
    return
  }

  // 找到对应的分类标签
  const categoryLabel =
    categoryOptions.find((opt) => opt.value === formData.value.category)
      ?.label || ''

  const newKnowledge = {
    id: Math.max(...knowledgeBase.value.map((k) => k.id), 0) + 1,
    ...formData.value,
    categoryLabel,
    status: '未发布',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
  }

  knowledgeBase.value.push(newKnowledge)
  showAddModal.value = false

  // 重置表单
  formData.value = {
    name: '',
    description: '',
    category: undefined,
    tags: [],
  }

  message.success('知识添加成功')
}
</script>

<style scoped>
.knowledge-base-view {
  padding: 24px;
  background-color: #fafafa;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background-color: white;
  padding: 16px;
  border-radius: 4px;
}

:deep(.ant-table) {
  background-color: white;
  border-radius: 4px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>
