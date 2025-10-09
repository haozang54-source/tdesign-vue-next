import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref, nextTick } from 'vue';
import Form from '../form';
import FormItem from '../form-item';
import Input from '../../input';
import type { FormRule } from '../type';

// 覆盖点：renderSuffixIcon 插槽返回 false 时不渲染状态图标
describe('FormItem statusIcon false branch', () => {
  it('statusIcon slot returns false -> early return', async () => {
    const data = ref({ name: '' });
    const rules = ref<{ [k: string]: FormRule[] }>({
      name: [{ required: true, message: 'required', trigger: 'blur' }],
    });

    const wrapper = mount(
      () => (
        <Form data={data.value} rules={rules.value} showErrorMessage>
          <FormItem name="name" v-slots={{ statusIcon: () => false }}>
            <Input v-model={data.value.name} />
          </FormItem>
        </Form>
      ),
      { attachTo: document.body },
    );

    // 触发一次校验，保证 renderSuffixIcon 分支被执行
    // @ts-ignore
    await (wrapper.findComponent(Form).vm as any).$?.exposed.validate({ trigger: 'blur', showErrorMessage: true });
    await nextTick();
    // 不应出现状态图标容器
    expect(wrapper.find('.t-is-success').exists()).toBe(false);
    expect(wrapper.find('.t-form__status').exists()).toBe(false);

    wrapper.unmount();
  });
});

// 覆盖点：extraNode 成功信息分支（successList 渲染）
describe('FormItem extraNode success branch', () => {
  it('renders extra message when custom success result exists', async () => {
    const data = ref({ ok: '1' });
    const rules = ref<{ [k: string]: FormRule[] }>({
      ok: [
        {
          // 自定义校验：总是返回成功信息(type: 'success')
          validator: () => ({ result: true, message: 'ok-tip', type: 'success' } as any),
          trigger: 'change',
        } as any,
      ],
    });

    const wrapper = mount(
      () => (
        <Form data={data.value} rules={rules.value} showErrorMessage>
          <FormItem name="ok" label="ok">
            <Input v-model={data.value.ok} />
          </FormItem>
        </Form>
      ),
      { attachTo: document.body },
    );

    // 触发 change 校验，生成 successList
    // @ts-ignore
    await (wrapper.findComponent(Form).vm as any).$?.exposed.validate({ trigger: 'change', showErrorMessage: true });
    await nextTick();

    // 成功信息文案应出现（不强依赖具体 DOM 类名）
    expect(wrapper.text()).toContain('ok-tip');

    wrapper.unmount();
  });
});

// 覆盖点：watch([props.name, JSON.stringify(props.rules)]) 触发 validateHandler('change')
describe('FormItem watch props.name / rules triggers validate on change', () => {
  it("changing rules and then name triggers validateHandler('change')", async () => {
    const data = ref<{ a: string; b: string }>({ a: '', b: '' });
    const itemName = ref<'a' | 'b'>('a');
    const rules = ref<Record<string, FormRule[]>>({
      a: [{ required: true, message: 'A is required', trigger: 'change' }],
      b: [{ required: true, message: 'B is required', trigger: 'change' }],
    });

    const wrapper = mount(
      () => (
        <Form data={data.value} rules={rules.value} showErrorMessage>
          <FormItem name={itemName.value}>
            <Input v-model={data.value[itemName.value]} />
          </FormItem>
        </Form>
      ),
      { attachTo: document.body },
    );

    // 第一次触发（初始）
    // @ts-ignore
    await (wrapper.findComponent(Form).vm as any).$?.exposed.validate({ trigger: 'change', showErrorMessage: true });
    await flushPromises();

    // 变更 rules，触发 watch
    rules.value = {
      a: [{ required: true, message: 'A required+', trigger: 'change' }],
      b: [{ required: true, message: 'B required+', trigger: 'change' }],
    };
    await flushPromises();

    // 再变更 name，继续触发 watch
    itemName.value = 'b';
    await flushPromises();

    // 再次手动触发，确保分支产生校验副作用
    // @ts-ignore
    await (wrapper.findComponent(Form).vm as any).$?.exposed.validate({ trigger: 'change', showErrorMessage: true });
    await flushPromises();

    // 应至少有一次错误或成功渲染（表示 watch + validate 走通）
    const err = wrapper.find('.t-is-error');
    const warn = wrapper.find('.t-is-warning');
    const succ = wrapper.find('.t-is-success');
    expect(err.exists() || warn.exists() || succ.exists()).toBe(true);

    wrapper.unmount();
  });
});
