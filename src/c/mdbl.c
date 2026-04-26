#include <pebble.h>

static Window *s_window;

int main(void) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "--- C START ---");
  
  s_window = window_create();
  window_set_background_color(s_window, GColorBlack);
  window_stack_push(s_window, true);

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Machine creating...");
  moddable_createMachine(NULL);

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Entering event loop...");
  app_event_loop();
  
  window_destroy(s_window);
  return 0;
}
