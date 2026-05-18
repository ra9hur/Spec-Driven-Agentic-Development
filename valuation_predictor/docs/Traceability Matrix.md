
This matrix maps your project's technical specifications and styling parameters directly to the test methods that cover them, ensuring total test coverage before launch.

| Requirement ID | Technical Specification / Component Target | Target File Vector            | Targeted Testing Method                                          |
| -------------- | ------------------------------------------ | ----------------------------- | ---------------------------------------------------------------- |
| **REQ-01**     | Color Token Palettes Configuration         | `tailwind.config.js`          | Checked across UI render initializations                         |
| **REQ-02**     | Form Cache Allocation (`sessionStorage`)   | `services/session.js`         | `test_data_security_control`                                      |
| **REQ-03**     | Local Memory State Destruction Protocol    | `services/session.js`         | `test_data_discard_protocol`                                      |
| **REQ-04**     | Branding Landing Screen Setup              | `views/LandingPage.jsx`       | `test_landing_ui_display`                                        |
| **REQ-05**     | Legal Disclosure Modal Window              | `views/Disclaimer.jsx`        | `test_disclaimer_intercept_modal`                                |
| **REQ-06**     | Acceptance Checkbox Gate Lock              | `views/Disclaimer.jsx`        | `test_disclaimer_validation_gate`                                |
| **REQ-07**     | 5-Step Progressive Navigation Track        | `views/FormWizard.jsx`        | `test_wizard_layout_flow`                                        |
| **REQ-08**     | Mobile Viewport CSS Grid Realignment       | `views/FormWizard.jsx`        | `test_responsive_reflow_constraints`                             |
| **REQ-09**     | Form Step 1 Metrics Compilation            | `views/steps/Step1BasicInfo.jsx` | `test_form_step_validation_gates`                             |
| **REQ-10**     | Form Step 2 Metrics Compilation            | `views/steps/Step2Traction.jsx`  | `test_form_step_validation_gates`                             |
| **REQ-11**     | Form Step 3 Metrics Compilation            | `views/steps/Step3Market.jsx`    | `test_form_step_validation_gates`                             |
| **REQ-12**     | Form Step 4 Metrics Compilation            | `views/steps/Step4Team.jsx`      | `test_form_step_validation_gates`                             |
| **REQ-13**     | Form Step 5 Metrics Compilation            | `views/steps/Step5Financial.jsx` | `test_form_step_validation_gates`                             |
| **REQ-14**     | Keystroke Numerical Filtering Layer        | `components/FormInput.jsx`    | `test_string_input_filtering_controls`                           |
| **REQ-15**     | Trigger Button Calculation Label           | `views/FormWizard.jsx`        | `test_submission_trigger_action_ui`                              |
| **REQ-16**     | Outbound Client Fetch Operations Protocol  | `services/api.js`             | `test_asynchronous_request_gateway`                              |
| **REQ-17**     | Pydantic Request Parsing Gateway           | `backend/src/schemas.py`      | `test_pydantic_layer_rejection_handling`                         |
| **REQ-18**     | Stage Calculation Baseline Allocation      | `backend/src/engine.py`       | `test_base_valuation_branch_allocation`                          |
| **REQ-19**     | Management Core Multiplier Scoring         | `backend/src/engine.py`       | `test_pillar_modifier_team_logic`                                |
| **REQ-20**     | Performance Scaler Retention Bonus         | `backend/src/engine.py`       | `test_pillar_modifier_traction_retention_bonus`                  |
| **REQ-21**     | Risk Variable & Solo Founder Penalties     | `backend/src/engine.py`       | `test_pillar_modifier_risk_solo_penalties`                       |
| **REQ-22**     | Minimum/Maximum Formula Engine Limits      | `backend/src/engine.py`       | `test_mathematical_bounds_engine_guardrails`                     |
| **REQ-23**     | Output Bounds Range Evaluation Logic       | `backend/src/engine.py`       | `test_output_target_range_division`                              |
| **REQ-24**     | Dynamic Confidence Scaling Utilities       | `backend/src/engine.py`       | `test_deterministic_confidence_computation`                      |
| **REQ-25**     | Local Ollama AI Prompt Delivery            | `backend/src/main.py`         | `test_ollama_api_transmission`                                    |
| **REQ-26**     | 5.0-Second API Network Isolation Wrapper   | `backend/src/main.py`         | `test_ai_fault_tolerant_circuit_breaker`                         |
| **REQ-27**     | Local Default Fallback Report Fallbacks    | `backend/src/main.py`         | `test_network_timeout_fallback_execution`                        |
| **REQ-28**     | App Loading UI Feedback Layer              | `components/LoadingState.jsx` | `test_asynchronous_ui_loading_state`                             |
| **REQ-29**     | Results Page Layout Distribution Grid      | `views/Dashboard.jsx`         | `test_three_column_financial_display`                            |
| **REQ-30**     | Analytics Metric Tracker Color Bars        | `components/ProgressBar.jsx`  | `test_multi_bar_visual_metrizations`                             |
| **REQ-31**     | Matrix Inferred Insights Display Split     | `views/Dashboard.jsx`         | `test_two_column_profile_matrix`                                 |
| **REQ-32**     | Interactive Footer Management Panel        | `views/Dashboard.jsx`         | `test_action_bar_functional_handlers`                            |
| **REQ-33**     | Input State Styling Rules (Rest/Focus/Disabled) | `components/FormInput.jsx` | `test_input_state_styling_rules`                            |
| **REQ-34**     | Recommendation Text Engine Block            | `views/Dashboard.jsx`         | `test_recommendation_text_engine_block`                           |
| **NFR-01**     | Stateless Web Microservice Standards       | `backend/src/main.py`         | Verified across endpoint system designs                          |
| **NFR-02**     | URL Traversal Trap Implementations         | `views/Disclaimer.jsx`        | `test_disclaimer_intercept_modal`                                |
| **NFR-03**     | Zero-Tutorial UI Layout Strategy           | `frontend/src/`               | `test_wizard_layout_flow`                                        |
| **NFR-04**     | State Retention Performance                | `views/FormWizard.jsx`        | `test_wizard_layout_flow`                                        |
| **NFR-05**     | Real-Time Engine Math Overhead limits      | `backend/src/engine.py`       | `test_asynchronous_request_gateway`                              |
| **NFR-06**     | Modular Software Design Blueprint          | `backend/src/`                | Checked via file architecture structure reviews                  |
| **NFR-07**     | Ollama Config Isolation                   | `backend/.env`                | `test_network_timeout_fallback_execution`                        |
| **NFR-08**     | Offline Workflow Turnaround Metric limits  | `backend/src/main.py`         | `test_network_timeout_fallback_execution`                        |
| **NFR-09**     | Multi-Indicator Visual Requirements        | `views/Dashboard.jsx`         | `test_two_column_profile_matrix`                                 |
| **NFR-10**     | Print Media White Background Overrides     | `frontend/src/index.css`      | `test_action_bar_functional_handlers`                            |
