import { describe, it, expect } from 'vitest';
import { validate } from '../utils/form-model';

// 基于 utils 的规则验证，覆盖：
// - max 分支在值为非 number 时走 getCharacterLength 路径
// - 针对 rule[key] === 0 的判断分支（如 min: 0）
// - 最终 return validateResult 的路径

describe('form-model utils validate branches', () => {
  it('covers non-number path for max and rule[key] === 0 condition', async () => {
    // 规则集：max 与 min，其中 min 为 0 以命中 rule[key] === 0 的分支
    const rules = [
      // 非数字，走字符长度 max 判断
      { max: 5, message: 'too-long' },
      // min 为 0，命中 (rule[key] || rule[key] === 0)
      { min: 0, message: 'too-short' },
    ];

    // 值使用字符串以触发非数字路径
    const ok = await validate('abcd', rules as any);
    // 期望通过：'abcd' 长度 4 <= max 5，且 min 0 通过
    expect(ok.every((r: any) => r.result === true)).toBe(true);

    const fail = await validate('abcdef', rules as any);
    // 长度 6 > max 5，应返回带 message 的失败项
    expect(fail.some((r: any) => r.result !== true && r.message === 'too-long')).toBe(true);
  });
});
