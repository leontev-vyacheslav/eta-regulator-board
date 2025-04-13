class RegulationEngineConfig:
    updating_rtc_period = 60
    default_room_temperature = 20
    default_hot_water_temperature = 60
    default_room_temperature_influence = 0.0
    default_return_temperature_influence = 0.0
    updating_settings_factor = 5

    start_current_hour_template = {'minute': 1, 'second': 0, 'microsecond': 0}
    end_current_hour_template = {'minute': 59, 'second': 59, 'microsecond': 0}
    start_current_day_template = {'hour': 0, 'minute': 0, 'second': 0, 'microsecond': 0}