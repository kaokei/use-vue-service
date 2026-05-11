<script setup lang="ts">
</script>

<template>
  <div style="max-width: 640px;">
    <h1>⏱ 倒计时服务示例</h1>
    <p style="color: #666;">
      每个倒计时组件通过 <code>declareProviders</code> 绑定独立的 CountdownService 实例，互不干扰。
    </p>

    <!-- 文本样式：不同结束时间 -->
    <section style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>文本样式 — 独立实例</h2>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <CountdownText :total-seconds="90" label="90 秒" />
        <CountdownText :total-seconds="3600" label="1 小时" />
        <CountdownText :total-seconds="90000" label="25 小时" />
      </div>
    </section>

    <!-- 卡片样式：同一个组件多次使用 -->
    <section style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>卡片样式 — 多个实例</h2>
      <div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center;">
        <CountdownBlocks :total-seconds="120" label="活动 A（2分钟）" />
        <CountdownBlocks :total-seconds="3661" label="活动 B（1小时1分1秒）" />
      </div>
    </section>

    <!-- 混合：文本+卡片共用不同服务 -->
    <section style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
      <h2>混合显示 — 各自独立</h2>
      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <CountdownText :total-seconds="180" label="抢购" />
        <CountdownBlocks :total-seconds="180" label="同一时长" />
      </div>
      <p style="margin-top: 8px; font-size: 13px; color: #999;">
        左右两个倒计时都是 180 秒，但各自由独立的 CountdownService 实例驱动
      </p>
    </section>

    <!-- 实现要点 -->
    <section style="margin-top: 24px; padding: 16px; background: #e8f5e9; border-radius: 6px; font-size: 14px; color: #555;">
      <strong>💡 架构要点：</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px;">
        <li><strong>组件级服务</strong> — 每个倒计时组件内部调用 <code>declareProviders([CountdownService])</code>，获得独立实例</li>
        <li><strong>@PreDestroy 自动清理</strong> — 组件卸载时 <code>dispose()</code> 自动清除定时器，防止内存泄漏</li>
        <li><strong>不同展现方式</strong> — CountdownText（行内文本）和 CountdownBlocks（卡片数字）共享同一个 Service 类</li>
        <li><strong>递归 setTimeout 倒计时</strong> — <code>tick()</code> 通过 setTimeout 递归调用自身，实现精确毫秒级倒计时</li>
      </ul>
    </section>
  </div>
</template>
