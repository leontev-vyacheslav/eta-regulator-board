class RegulationEngineMessages:
    sensors_polling_started_info_msg = 'The polling thread was STARTED.'
    sensors_polling_stopped_info_msg = 'The polling thread was STOPPED.'
    sensors_polling_slept_debug_msg = 'The polling thread executed/slept during %.6f / %.6f sec.\r\n'
    sensors_polling_thread_error_msg = 'The polling thread was failed with the error: %s.'

    regulation_started_info_msg = 'The regulation thread was STARTED.'
    regulation_stopped_info_msg = 'The regulation thread was STOPPED.'
    regulation_stopped_critical_msg = "The regulation thread was STOPPED because the polling thread terminated with an error."
    regulation_slept_debug_msg = 'The regulation thread executed/slept during %.6f / %.6f sec.'
    regulation_thread_error_msg = 'The regulation thread was failed with the error: %s.'

    measured_temperatures_debug_msg = 'The measured temperatures: OUTDOOR=%.2f, ROOM=%.2f SUPPLY=%.2f; RETURN=%.2f'
    calculated_temperatures_debug_msg = 'The calculated temperatures: SUPPLY=%.2f, RETURN=%.2f'
    settings_refresh_debug_msg = 'Settings was refreshed'
    writing_archives_debug_msg = 'Writing archives has been completed: %s'
    getting_current_rtc_debug_msg = 'Current RTC datetime: %s'
    pid_impact_components_debug_msg = 'The PID impact components: P=%.2f, I=%.2f, D=%.2f, SUM=%.2f DEV=%.2f, TOTAL=%.2f'
    pid_impact_result_debug_msg = 'The PID impact result: PID=%.2f%%'
    analog_impact_result_debug_msg = 'The analog impact result: ANL=%.2f%%'
    writing_archives_error_msg = 'An error has happened during writing archives: %s'