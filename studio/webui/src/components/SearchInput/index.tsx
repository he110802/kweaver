/**
 * 基于antd再封装的搜索框
 * 中文输入时默认劫持onChange事件, 中文输入结束才触发onChange
 */

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';
import classNames from 'classnames';
import IconFont from '@/components/IconFont';
import './style.less';

export interface SearchInputProps extends InputProps {
  onIconClick?: Function; // 点击icon回调
  onClear?: Function; // 清空搜索框回调
}

const SearchInput: React.ForwardRefRenderFunction<unknown, SearchInputProps> = (
  { className = '', onChange, onPressEnter, onIconClick, onClear, ...otherProps },
  ref
) => {
  const inputRef = useRef<any>();
  const isCompos = useRef(false); // 标记键盘输入法

  // 转发ref
  useImperativeHandle(ref, () => inputRef.current);

  const handleChange = (e: any) => {
    if (isCompos.current) return;

    onChange?.(e);

    // antd没有暴露清除按钮的事件回调, 但清除时会触发onChange
    if (e.type === 'click' && !e.target.value) {
      setTimeout(() => {
        handleClear(e);
      }, 0);
    }
  };

  const handleStart = () => {
    isCompos.current = true;
  };

  const handleEnd = (e: any) => {
    isCompos.current = false;
    onChange?.(e);
  };

  /**
   * 点击前缀搜索图标, 默认触发回车搜索
   */
  const onPrefixClick = (e: any) => {
    onIconClick ? onIconClick(e) : onPressEnter?.(e);
  };

  /**
   * 处理清空输入框事件, 默认触发回车搜索
   */
  const handleClear = (e: any) => {
    onClear ? onClear(e) : onPressEnter?.(e);
  };

  return (
    <Input
      ref={inputRef}
      allowClear
      className={classNames('ad-search-input', className)}
      prefix={<IconFont type="icon-sousuo" className="s-input-icon" onClick={onPrefixClick} />}
      onChange={handleChange}
      onPressEnter={onPressEnter}
      onCompositionStart={handleStart}
      onCompositionEnd={handleEnd}
      {...otherProps}
    />
  );
};

export default forwardRef(SearchInput);
