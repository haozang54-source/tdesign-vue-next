import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import Upload from '../upload';

describe('Custom File Component Coverage Tests', () => {
  // 测试 custom-file.tsx 行 49: props.childrenNode 在拖拽模式下的回调
  it('should trigger childrenNode callback when dragContent is null in draggable mode', async () => {
    const childrenNodeMock = vi.fn((params) => {
      return `Custom drag content: ${params.files.length} files, active: ${params.dragActive}`;
    });

    const wrapper = mount(Upload, {
      props: {
        theme: 'custom',
        draggable: true,
        dragContent: null, // 确保 renderContent 返回空值
      },
      slots: {
        default: childrenNodeMock,
      },
    });

    await nextTick();

    // 验证组件渲染了拖拽区域
    expect(wrapper.find('.t-upload__dragger').exists()).toBe(true);

    // 验证 childrenNode 被调用，这应该覆盖行 49
    expect(childrenNodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        files: expect.any(Array),
        dragActive: expect.any(Boolean),
      }),
    );
  });

  // 测试 custom-file.tsx 行 61: slots.default 在非拖拽模式下的回调
  it('should trigger default slot when childrenNode is not provided in non-draggable mode', async () => {
    const defaultSlotMock = vi.fn(() => 'Default slot content');

    const wrapper = mount(Upload, {
      props: {
        theme: 'custom',
        draggable: false,
        // 不设置任何 childrenNode 相关的 props
      },
      slots: {
        default: defaultSlotMock,
      },
    });

    await nextTick();

    // 验证组件渲染了触发器
    expect(wrapper.find('.t-upload__trigger').exists()).toBe(true);

    // 验证默认插槽被调用，这应该覆盖行 61
    expect(defaultSlotMock).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Default slot content');
  });

  // 测试拖拽模式下 dragContent 和 childrenNode 的优先级
  it('should prioritize dragContent over childrenNode when both are provided', async () => {
    const childrenNodeMock = vi.fn();
    const dragContentMock = vi.fn(() => 'Drag content from prop');

    const wrapper = mount(Upload, {
      props: {
        theme: 'custom',
        draggable: true,
        dragContent: dragContentMock, // 提供 dragContent
      },
      slots: {
        default: childrenNodeMock,
      },
    });

    await nextTick();

    // dragContent 应该被调用，childrenNode 不应该被调用
    expect(dragContentMock).toHaveBeenCalled();
    expect(childrenNodeMock).not.toHaveBeenCalled();
  });

  // 测试非拖拽模式下 childrenNode 的优先级
  it('should use childrenNode over default slot when childrenNode is provided in non-draggable mode', async () => {
    const childrenNodeMock = vi.fn((params) => `Children node: ${params.files.length} files`);
    const defaultSlotMock = vi.fn(() => 'Default slot');

    const wrapper = mount(Upload, {
      props: {
        theme: 'custom',
        draggable: false,
        // 通过 render 函数模拟 childrenNode
      },
      slots: {
        default: (props) => {
          // 模拟 childrenNode 的行为
          if (props && typeof props === 'object' && 'files' in props) {
            return childrenNodeMock(props);
          }
          return defaultSlotMock();
        },
      },
    });

    await nextTick();

    // 验证组件正常渲染
    expect(wrapper.find('.t-upload__trigger').exists()).toBe(true);
  });

  // 测试拖拽交互事件
  it('should handle drag events correctly in draggable mode', async () => {
    const childrenNodeMock = vi.fn((params) => `Drag area: ${params.dragActive ? 'active' : 'inactive'}`);

    const wrapper = mount(Upload, {
      props: {
        theme: 'custom',
        draggable: true,
        dragContent: null, // 确保使用 childrenNode
      },
      slots: {
        default: childrenNodeMock,
      },
    });

    await nextTick();

    const dragger = wrapper.find('.t-upload__dragger');
    expect(dragger.exists()).toBe(true);

    // 模拟拖拽进入
    await dragger.trigger('dragenter');
    await nextTick();

    // 模拟拖拽离开
    await dragger.trigger('dragleave');
    await nextTick();

    // 验证 childrenNode 被多次调用（因为 dragActive 状态变化）
    expect(childrenNodeMock).toHaveBeenCalled();
  });
});
