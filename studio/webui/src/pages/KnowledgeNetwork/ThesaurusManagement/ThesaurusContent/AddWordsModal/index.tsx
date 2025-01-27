import React, { useEffect, useState } from 'react'
import _ from 'lodash';
import { Modal, Form, Input, message } from 'antd';
import intl from 'react-intl-universal';

import serverThesaurus from '@/services/thesaurus';

const EDIT_ERROR: Record<string, string> = {
  'Builder.LexiconController.EditLexiconWord.LexiconIdNotExist': 'ThesaurusManage.nullThesaurusId',
  'Builder.LexiconController.EditLexiconWord.FormatMismatch': 'ThesaurusManage.formatMismatch',
  'Builder.LexiconController.EditLexiconWord.LexiconWordNotExist': 'ThesaurusManage.wordNotExist',
  'Builder.LexiconController.InsertLexiconWord.FormatMismatch': 'ThesaurusManage.formatMismatch',
  'Builder.LexiconController.InsertLexiconWord.InvalidStatus': 'ThesaurusManage.editwordsError',
  'Builder.LexiconController.EditLexiconWord.InvalidStatus': 'ThesaurusManage.editwordsError'
}
const AddWordsModal = (props: any) => {
  const [form] = Form.useForm();
  const { isVisible, type, columns, page, selectedThesaurus, editRecord } = props;
  const { closeModal, getThesaurusById, setpage } = props;
  const [isExisted, setIsExisted] = useState<boolean>(false); // 词汇是否重复的错

  useEffect(() => {
    if (type === 'edit') {
      form.setFieldsValue({ ...editRecord });
    }
  }, [type, editRecord, isVisible])

  /**
   * 确认提交
   */
  const onSubmit = () => {
    form.validateFields().then(async values => {
      // 去掉首尾空格
      _.forIn(values, (value, key) => {
        values[key] = value.replace(/(^\s*)|(\s*$)/g, '');
      });

      if (type === 'add') {
        const data = {
          word_info: values,
          id: selectedThesaurus?.id
        }

        try {
          const response = await serverThesaurus.thesaurusInsertWords(data);
          const { ErrorCode } = response || {};
          if (ErrorCode === 'Builder.LexiconController.InsertLexiconWord.WordExisted') {
            setIsExisted(true);
            setFormError();
            return;
          }
          if (ErrorCode) {
            EDIT_ERROR[ErrorCode] ? message.error(intl.get(EDIT_ERROR[ErrorCode]))
              : message.error(response?.ErrorDetails);
            return;
          }
          message.success(intl.get('ThesaurusManage.addWordSuccess'));
          setpage(1);
          closeModal();
          getThesaurusById(selectedThesaurus);
        } catch (err) {
          //
          closeModal();
        }
      }

      if (type === 'edit') {
        const data = {
          new_info: values,
          old_info: editRecord,
          id: selectedThesaurus?.id
        }
        try {
          const response = await serverThesaurus.thesaurusEditWords(data);
          const { ErrorCode } = response || {};
          if (ErrorCode === 'Builder.LexiconController.EditLexiconWord.LexiconWordExisted') {
            setIsExisted(true);
            setFormError();
            return;
          }
          if (ErrorCode) {
            EDIT_ERROR[ErrorCode] ? message.error(intl.get(EDIT_ERROR[ErrorCode]))
              : message.error(response?.ErrorDetails);
            return;
          }
          message.success(intl.get('ThesaurusManage.editWordsSuccess'));
          closeModal();
          getThesaurusById(selectedThesaurus, page);
        } catch (err) {
          closeModal();
        }
      }
    })
  }
  // 设置错误状态
  const setFormError = () => {
    _.forEach(columns, (item: any, index: number) => {
      form.setFields([
        {
          name: item.dataIndex,
          errors: [intl.get('ThesaurusManage.wordsExists')]
        }
      ]);
    })
  }
  // 恢复正确的状态
  const setFormSuccess = () => {
    if (!isExisted) return;
    form.validateFields();
  }
  const onCancel = () => { closeModal() }
  return (
    <Modal
      visible={isVisible}
      width={460}
      keyboard={false}
      forceRender={true}
      maskClosable={false}
      wrapClassName="modal-add-words"
      title={type === 'add' ? [intl.get('ThesaurusManage.addWords')] : [intl.get('ThesaurusManage.editWords')]}
      onOk={onSubmit}
      onCancel={onCancel}
      afterClose={() => {
        form.resetFields();
      }}
    >
      <div>
        <Form
          form={form}
          layout="vertical"
        >
          {columns.map((item: any, index: number) => {
            return (
              index !== columns.length - 1 ?
                <React.Fragment key={index}>
                  <Form.Item
                    name={item.dataIndex}
                    label={item.dataIndex}
                    rules={[
                      {
                        required: true,
                        message: intl.get('global.noNull')
                      },
                      {
                        validator: async (rule, value) => {
                          const test =
                            /([\\s\u4e00-\u9fa5_a-zA-Z0-9=~!@#$&%^&*()_+`'"{}[\];:,.?<>|/~！@#￥%…&*·（）—+。={}|【】：；‘’“”、《》？，。/\n\\]+$)|-/;
                          const reg = /(^\s*|\s*$)/g;

                          if (value?.toString().replace(reg, '').length > 50) {
                            return Promise.reject([intl.get('datamanagement.maxLength')]);
                          }

                          if (value && !test.test(value?.toString()?.replace(reg, ''))) {
                            return Promise.reject([intl.get('graphList.onlyKeyboard')]);
                          }
                        }
                      }
                    ]}
                  >
                    <Input
                      placeholder={intl.get('searchConfig.pleaseInput')}
                      autoComplete="off"
                      onChange={e => {
                        const { value } = e.target;
                        if (value === ' ') {
                          form.setFieldsValue({ [item.dataIndex]: value.trim() });
                        }
                        setFormSuccess();
                        setIsExisted(false);
                      }}
                    />
                  </Form.Item>
                </React.Fragment> : null
            )
          })}
        </Form>
      </div>
    </Modal >
  )
}
export default AddWordsModal;
