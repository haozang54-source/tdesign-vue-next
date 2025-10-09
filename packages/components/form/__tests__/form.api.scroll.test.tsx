import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, Fragment } from 'vue';
import { Form, FormItem, Input } from '@tdesign/components';
import { sleep } from '@tdesign/internal-utils';

describe('Form API - scrollToFirstError & setValidateMessage(empty)', () => {
  let origScrollIntoView: any;

  beforeEach(() => {
    // JSDOM: stub scrollIntoView
    origScrollIntoView = (Element.prototype as any).scrollIntoView;
    (Element.prototype as any).scrollIntoView = vi.fn();
  });

  afterEach(() => {
    (Element.prototype as any).scrollIntoView = origScrollIntoView;
    vi.restoreAllMocks();
  });

  it('calls scrollIntoView when scrollToFirstError is set and validate fails', async () => {
    const data = ref({ name: '' });
    const rules = {
      name: [{ required: true, message: 'required' }],
    };

    const wrapper = mount(Form, {
      attachTo: document.body,
      props: {
        data,
        rules,
        scrollToFirstError: 'auto',
      },
      slots: {
        default: () => (
          <Fragment>
            <FormItem label="name" name="name">
              <Input v-model={data.value.name} />
            </FormItem>
          </Fragment>
        ),
      },
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$.exposed.validate();
    await sleep(16);

    // form-item block for "name" exists and should have called scrollIntoView
    expect((Element.prototype as any).scrollIntoView).toHaveBeenCalled();
  });

  it('setValidateMessage({}) should early return (no throw, no changes)', async () => {
    const data = ref({ name: '' });
    const rules = {
      name: [{ required: true, message: 'required' }],
    };

    const wrapper = mount(Form, {
      attachTo: document.body,
      props: { data, rules },
      slots: {
        default: () => (
          <FormItem label="name" name="name">
            <Input v-model={data.value.name} />
          </FormItem>
        ),
      },
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$.exposed.validate();
    // baseline: has error extra
    const prevText = wrapper.find('.t-input__extra').text();

    // Empty message object - should hit keys.length === 0 return branch
    form.vm.$.exposed.setValidateMessage({} as any);
    await sleep(16);

    // Still stable, no exception, error text unchanged
    expect(wrapper.find('.t-input__extra').text()).toBe(prevText);
  });
});
