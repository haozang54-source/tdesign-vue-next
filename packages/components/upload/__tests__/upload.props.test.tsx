import { describe, it, expect } from 'vitest';
import uploadProps from '../props';

describe('Upload Props Validator Tests', () => {
  // 测试 method validator 的空值分支 (行 120)
  it('should handle method validator with empty values', () => {
    const methodValidator = uploadProps.method.validator;

    // 测试空值情况 - 这些应该返回 true (覆盖行 120)
    expect(methodValidator(undefined)).toBe(true);
    expect(methodValidator(null)).toBe(true);
    expect(methodValidator('')).toBe(true);

    // 测试有效值
    expect(methodValidator('POST')).toBe(true);
    expect(methodValidator('GET')).toBe(true);
    expect(methodValidator('put')).toBe(true);
    expect(methodValidator('patch')).toBe(true);

    // 测试无效值
    expect(methodValidator('INVALID')).toBe(false);
  });

  // 测试 status validator 的空值分支 (行 164)
  it('should handle status validator with empty values', () => {
    const statusValidator = uploadProps.status.validator;

    // 测试空值情况 - 这些应该返回 true (覆盖行 164)
    expect(statusValidator(undefined)).toBe(true);
    expect(statusValidator(null)).toBe(true);
    expect(statusValidator('')).toBe(true);

    // 测试有效值
    expect(statusValidator('default')).toBe(true);
    expect(statusValidator('success')).toBe(true);
    expect(statusValidator('warning')).toBe(true);
    expect(statusValidator('error')).toBe(true);

    // 测试无效值
    expect(statusValidator('invalid')).toBe(false);
  });

  // 测试 theme validator 的空值分支 (行 173)
  it('should handle theme validator with empty values', () => {
    const themeValidator = uploadProps.theme.validator;

    // 测试空值情况 - 这些应该返回 true (覆盖行 173)
    expect(themeValidator(undefined)).toBe(true);
    expect(themeValidator(null)).toBe(true);
    expect(themeValidator('')).toBe(true);

    // 测试有效值
    expect(themeValidator('custom')).toBe(true);
    expect(themeValidator('file')).toBe(true);
    expect(themeValidator('file-input')).toBe(true);
    expect(themeValidator('file-flow')).toBe(true);
    expect(themeValidator('image')).toBe(true);
    expect(themeValidator('image-flow')).toBe(true);

    // 测试无效值
    expect(themeValidator('invalid')).toBe(false);
  });

  // 测试 props 的默认值和类型
  it('should have correct default values and types', () => {
    expect(uploadProps.accept.default).toBe('');
    expect(uploadProps.action.default).toBe('');
    expect(uploadProps.autoUpload.default).toBe(true);
    expect(uploadProps.max.default).toBe(0);
    expect(uploadProps.method.default).toBe('POST');
    expect(uploadProps.name.default).toBe('file');
    expect(uploadProps.placeholder.default).toBe('');
    expect(uploadProps.showImageFileName.default).toBe(true);
    expect(uploadProps.showUploadProgress.default).toBe(true);
    expect(uploadProps.theme.default).toBe('file');
    expect(uploadProps.uploadPastedFiles.default).toBe(true);
    expect(uploadProps.useMockProgress.default).toBe(true);
  });

  // 测试 props 的类型定义
  it('should have correct prop types', () => {
    expect(uploadProps.accept.type).toBe(String);
    expect(uploadProps.action.type).toBe(String);
    expect(uploadProps.autoUpload.type).toBe(Boolean);
    expect(uploadProps.allowUploadDuplicateFile).toBe(Boolean);
    expect(uploadProps.disabled.type).toBe(Boolean);
    expect(uploadProps.isBatchUpload).toBe(Boolean);
    expect(uploadProps.max.type).toBe(Number);
    expect(uploadProps.multiple).toBe(Boolean);
    expect(uploadProps.name.type).toBe(String);
    expect(uploadProps.placeholder.type).toBe(String);
    expect(uploadProps.showImageFileName.type).toBe(Boolean);
    expect(uploadProps.showThumbnail).toBe(Boolean);
    expect(uploadProps.showUploadProgress.type).toBe(Boolean);
    expect(uploadProps.uploadAllFilesInOneRequest).toBe(Boolean);
    expect(uploadProps.uploadPastedFiles.type).toBe(Boolean);
    expect(uploadProps.useMockProgress.type).toBe(Boolean);
    expect(uploadProps.withCredentials).toBe(Boolean);
  });
});
