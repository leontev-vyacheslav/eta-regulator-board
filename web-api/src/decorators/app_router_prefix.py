def app_route_prefix(original_route_function, prefix='', mask='{0}{1}'):

  def current_route_function(route, *args, **kwargs):
    return original_route_function(mask.format(prefix, route), *args, **kwargs)

  return current_route_function