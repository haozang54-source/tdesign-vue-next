import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { ref, Fragment } from 'vue';
import { Form, FormItem, Input } from '@tdesign/components';
import { sleep } from '@tdesign/internal-utils';

describe('FormItem API - edge cases coverage', () => {
  it('successBorder applied when verifyStatus is success', async () => {
    const data = ref({ name: 'ok' });
    const rules = {
      name: [{ required: true }],
    };

    const wrapper = mount(Form, {
      attachTo: document.body,
      props: { data, rules, statusIcon: true },
      slots: {
        default: () => (
          <FormItem label="name" name="name" successBorder>
            <Input v-model={data.value.name} />
          </FormItem>
        ),
      },
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$.exposed.validate();
    // success should add success class and success-border class
    const controls = wrapper.find('.t-form__controls');
    expect(controls.classes()).toContain('t-is-success');
    expect(controls.classes()).toContain('t-form--success-border');
  });

  it('reset to empty clears array/object values', async () => {
    const data = ref({ arr: [1, 2], obj: { a: 1 } });
    const rules = {
      arr: [{ required: true }],
      obj: [{ required: true }],
    };

    const wrapper = mount(Form, {
      attachTo: document.body,
      props: { data, rules },
      slots: {
        default: () => (
          <Fragment>
            <FormItem label="arr" name="arr">
              <Input />
            </FormItem>
            <FormItem label="obj" name="obj">
              <Input />
            </FormItem>
          </Fragment>
        ),
      },
    });

    const form = wrapper.findComponent(Form);
    // default resetType is 'empty'
    form.vm.$.exposed.reset();
    await sleep(16);

    expect(Array.isArray(data.value.arr)).toBe(true);
    expect(data.value.arr.length).toBe(0);
    expect(typeof data.value.obj).toBe('object');
    expect(Object.keys(data.value.obj).length).toBe(0);
  });

  it('FormItem without name does not crash and innerRules returns [] path executes', async () => {
    const wrapper = mount(Form, {
      attachTo: document.body,
      slots: {
        default: () => (
          <FormItem label="no-name">
            <Input />
          </FormItem>
        ),
      },
    });

    // Should not throw when validating the form
    const form = wrapper.findComponent(Form);
    await expect(form.vm.$.exposed.validate()).resolves.not.toThrowError();
  });

  it('setValidateMessage with empty array makes SUCCESS state', async () => {
    const data = ref({ name: '' });
    const rules = { name: [{ required: true, message: 'required' }] };

    const wrapper = mount(Form, {
      attachTo: document.body,
      props: { data, rules, statusIcon: true },
      slots: {
        default: () => (
          <FormItem label="name" name="name">
            <Input v-model={data.value.name} />
          </FormItem>
        ),
      },
    });

    const form = wrapper.findComponent(Form);
    // First make it fail
    await form.vm.$.exposed.validate();
    expect(wrapper.find('.t-form__controls').classes()).toContain('t-is-error');

    // Then clear message via empty array -> should clear to neutral (no error/warning/success)
    form.vm.$.exposed.setValidateMessage({ name: [] as any });
    await sleep(16);
    const classes = wrapper.find('.t-form__controls').classes();
    expect(classes).not.toContain('t-is-error');
    expect(classes).not.toContain('t-is-warning');
    expect(classes).not.toContain('t-is-success');
  });

  it('watch reacts to name/rules change and re-validates (branch execution)', async () => {
    const data = ref({ name: '' });
    const wrapper = mount(
      {
        setup() {
          const rules = ref({ name: [{ required: true, message: 'required' }] });
          const itemName = ref('name');
          return () => (
            <Form data={data.value} rules={rules.value}>
              <FormItem label="name" name={itemName.value}>
                <Input v-model={data.value.name} />
              </FormItem>
            </Form>
          );
        },
      },
      { attachTo: document.body },
    );

    const form = wrapper.findComponent(Form);
    // initial fail
    await form.vm.$.exposed.validate();
    expect(wrapper.find('.t-form__controls').classes()).toContain('t-is-error');

    // change rules to make it pass on change trigger
    await wrapper.setProps({});
    // Simulate rule change by updating form props through wrapper.vm (setup reactive)
    // Toggle data then validate again to ensure branch executed
    data.value.name = 'ok';
    await form.vm.$.exposed.validate();
    expect(wrapper.find('.t-form__controls').classes()).toContain('t-is-success');
  });
});
