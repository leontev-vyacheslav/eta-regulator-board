root_path="."
read -r pid < "$root_path/src/PID_FILE"

if [ -n "$pid" ]; then
    echo "[$(date -u "+%Y-%m-%d %H:%M:%S")] [INFO] Terminating of web-api with PID $pid" >> "$root_path/startup.log"
    kill -TERM $pid
    wait $pid
    echo "[$(date -u "+%Y-%m-%d %H:%M:%S")] [INFO] The process of web-api with PID $pid was terminated" >> "$root_path/startup.log"
else
    echo "[$(date -u "+%Y-%m-%d %H:%M:%S")] [INFO] The process of web-api with PID $pid not found" >> "$root_path/startup.log"
fi


"$root_path/startup.sh" </dev/null >>"$root_path/startup.log" 2>&1 &
