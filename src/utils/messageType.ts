/**
 * 消息类型常量定义
 * 定义 HiCode 扩展的消息类型
 * 命名规范：
 * - F2B: Frontend to Backend (前端到后端)
 * - B2F: Backend to Frontend (后端到前端)
 * - REQ: Request (请求)
 * - RES: Response (响应)
 */

// ========== 聊天相关消息 ==========

/** 前端请求，前端发起问答请求 */
export const HICODE_ASK_QUESTION_F2B_REQ = 'hicode_ask_question_f2b_req'

/** 插件端响应，后端响应问答请求 */
export const HICODE_ASK_QUESTION_B2F_RES = 'hicode_ask_question_b2f_res'

// ========== 模型配置相关消息 ==========

/** 前端请求，获取模型列表 */
export const HICODE_GET_MODELS_F2B_REQ = 'hicode_get_models_f2b_req'

/** 插件端响应，获取模型列表响应 */
export const HICODE_GET_MODELS_B2F_RES = 'hicode_get_models_b2f_res'

/** 前端请求，切换当前模型 */
export const HICODE_CHANGE_MODEL_F2B_REQ = 'hicode_change_model_f2b_req'

/** 前端请求，新增模型配置 */
export const HICODE_ADD_MODEL_F2B_REQ = 'hicode_add_model_f2b_req'

/** 前端请求，编辑模型配置 */
export const HICODE_EDIT_MODEL_F2B_REQ = 'hicode_edit_model_f2b_req'

/** 前端请求，删除模型配置 */
export const HICODE_DELETE_MODEL_F2B_REQ = 'hicode_delete_model_f2b_req'

/** 插件端响应，刷新模型列表（新增/编辑/删除后） */
export const HICODE_REFRESH_MODELS_B2F_RES = 'hicode_refresh_models_b2f_res'

/** 前端请求，切换补全大模型 */
export const HICODE_CHANGE_FILL_MODEL_F2B_REQ = 'hicode_change_fill_model_f2b_req'

// ========== 系统消息 ==========

/** 前端通知，控制台日志 */
export const HICODE_CONSOLE_LOG = 'hicode_console_log'

/** 插件端通知，错误消息 */
export const HICODE_ERROR_B2F = 'hicode_error_b2f'

/** 插件端通知，新会话（系统消息） */
export const HICODE_NEW_CONVERSATION = 'hicode_new_conversation'

// ========== 代码选择相关消息 ==========

/** 插件端通知，代码选择变化（插件端到前端） */
export const HICODE_SELECTION_CHANGE = 'hicode_selection_change'

/** 前端请求，清除代码选择（前端到插件端） */
export const HICODE_CLEAR_SELECTION = 'hicode_clear_selection'

// ========== 代码操作相关消息 ==========

/** 前端请求，插入代码到编辑器（前端到插件端） */
export const HICODE_INSERT_CODE_F2B_REQ = 'hicode_insert_code_f2b_req'

// ========== 历史记录相关消息 ==========

/** 前端请求，打开历史记录 */
export const HICODE_OPEN_HISTORY = 'hicode_open_history'

// ========== 登录认证相关消息 ==========

/** 前端请求，域账号登录认证 */
export const HICODE_LOGIN_F2B_REQ = 'hicode_login_f2b_req'

/** 插件端响应，域账号登录认证响应 */
export const HICODE_LOGIN_B2F_RES = 'hicode_login_b2f_res'

// ========== 设置相关消息 ==========

/** 前端请求，获取设置数据 */
export const HICODE_GET_SETTINGS_F2B_REQ = 'hicode_get_settings_f2b_req'

/** 插件端响应，获取设置数据响应 */
export const HICODE_GET_SETTINGS_B2F_RES = 'hicode_get_settings_b2f_res'

// ========== 代码补全相关消息 ==========

/** 前端请求，切换代码补全设置 */
export const HICODE_CHANGE_COMPLETE_F2B_REQ = 'hicode_change_complete_f2b_req'

// ========== Prompt 模板相关消息 ==========

/** 前端请求，新增用户 Prompt 模板 */
export const HICODE_ADD_USER_PROMPT_F2B_REQ = 'hicode_add_user_prompt_f2b_req'

/** 前端请求，编辑用户 Prompt 模板 */
export const HICODE_EDIT_USER_PROMPT_F2B_REQ = 'hicode_edit_user_prompt_f2b_req'

/** 前端请求，删除用户 Prompt 模板 */
export const HICODE_DELETE_USER_PROMPT_F2B_REQ = 'hicode_delete_user_prompt_f2b_req'

/** 插件端响应，刷新用户 Prompt 模板列表 */
export const HICODE_REFRESH_USER_PROMPTS_B2F_RES = 'hicode_refresh_user_prompts_b2f_res'

// ========== 附加规范相关消息 ==========

/** 前端请求，新增附加规范 */
export const HICODE_ADD_SPECIFICATION_F2B_REQ = 'hicode_add_specification_f2b_req'

/** 前端请求，编辑附加规范 */
export const HICODE_EDIT_SPECIFICATION_F2B_REQ = 'hicode_edit_specification_f2b_req'

/** 前端请求，删除附加规范 */
export const HICODE_DELETE_SPECIFICATION_F2B_REQ = 'hicode_delete_specification_f2b_req'

/** 插件端响应，刷新附加规范列表 */
export const HICODE_REFRESH_SPECIFICATIONS_B2F_RES = 'hicode_refresh_specifications_b2f_res'

