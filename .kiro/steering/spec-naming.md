---
inclusion: auto
---

# Spec 命名规范

## 序号规则
- 每次创建新的 spec 时，需要在 `.kiro/specs/` 文件夹名称的开头增加序号
- 序号从 01 开始，依次递增（01、02、03...）
- 格式为：`{序号}.{feature-name}`，例如：`01.user-authentication`、`02.payment-processing`
- 创建新 spec 前，先检查 `.kiro/specs/` 下已有的文件夹，确定下一个可用序号
