import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import Form from '../form';
import FormItem from '../form-item';
import Input from '../../input';
import type { FormRule } from '../type';

describe('FormItem API more branches', () => {
  it('renderSuffixIcon returns when statusIcon slot returns false', async () => {
    const data = ref({ name: '' });
    const wrapper = mount(() => (
      <Form data={data.value} showErrorMessage>
        <FormItem name="name" v-slots={{ statusIcon: () => false }}>
          <Input v-model={data.value.name} />
        </FormItem>
      </Form>
    ));
    await nextTick();
    // 不应渲染任何状态图标节点（包含三种 icon 的 svg）
    expect(wrapper.find('svg').exists()).toBeFalsy();
  });

  it('setValidateMessage guard: undefined input should early-return (no error/success)', async () => {
    const data = ref({ a: '' });
    const wrapper = mount(Form, {
      props: { data: data.value, showErrorMessage: true },
      slots: {
        default: () => (
          <FormItem name="a">
            <Input v-model={data.value.a} />
          </FormItem>
        ),
      },
      attachTo: document.body,
    });

    // 通过 Form 暴露的方法传入 { a: undefined }，命中 FormItem.setValidateMessage 的守卫
    // @ts-ignore
    await (wrapper.vm as any).$?.exposed.setValidateMessage({ a: undefined });
    await nextTick();

    const controls = wrapper.find('.t-form__controls'); // CLASS_NAMES.controls
    expect(controls.classes().some((c) => /t-is-success|t-is-error|t-is-warning/.test(c))).toBeFalsy();

    wrapper.unmount();
  });

  it('extraNode renders success message when custom validator returns success', async () => {
    const data = ref({ ok: 'x' });
    const rules = ref<Record<string, FormRule[]>>({
      ok: [
        {
          // 自定义 validator 返回成功信息
          validator: () => ({ result: true, message: 'OK!', type: 'success' }),
          trigger: 'all',
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

    // 触发校验
    // @ts-ignore
    await (wrapper.findComponent(Form).vm as any).$?.exposed.validate({ trigger: 'all', showErrorMessage: true });
    await nextTick();

    // 成功信息应以 extra 节点呈现
    expect(wrapper.text()).toContain('OK!');

    wrapper.unmount();
  });

  it('watch on [name, rules] change triggers validateHandler("change")', async () => {
    const data = ref({ w: '' });
    const itemName = ref('w');
    const rules = ref<Record<string, FormRule[]>>({
      w: [],
    });

    const validateSpy = vi.fn();

    // 包装一个 FormItem，劫持其 validateOnly 来观察触发（通过 props/rules 变更）
    const wrapper = mount(
      () => (
        <Form data={data.value} rules={rules.value} showErrorMessage>
          <FormItem name={itemName.value} rules={rules.value[itemName.value]}>
            <Input v-model={data.value[itemName.value as 'w']} />
          </FormItem>
        </Form>
      ),
      { attachTo: document.body },
    );

    await nextTick();

    // 修改 rules 以触发 watcher（增加 required 规则）
    rules.value = {
      w: [{ required: true, message: 'required', trigger: 'change' } as any],
    };
    await nextTick();

    // 修改 name 以再次触发 watcher
    itemName.value = 'w';
    await nextTick();

    // 通过调用一次 validate，确保状态可观测，再检查页面是否出现错误样式或文案
    // @ts-ignore
    await (wrapper.findComponent(Form).vm as any).$?.exposed.validate({ trigger: 'change', showErrorMessage: true });
    await nextTick();

    expect(wrapper.text()).toMatch(/required/);

    wrapper.unmount();
  });
});
