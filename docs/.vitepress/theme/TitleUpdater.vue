<script setup>
import { useData } from 'vitepress'
import { watch } from 'vue'

const { page } = useData()
const baseTitle = 'RN/CF Boilerplate Docs'

if (typeof document !== 'undefined') {
  watch(
    () => page.value.title,
    (title) => {
      if (title && title !== baseTitle) {
        document.title = `${title} | ${baseTitle}`
      } else {
        document.title = baseTitle
      }
    },
    { immediate: true }
  )
}
</script>