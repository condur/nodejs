FROM fluent/fluentd:latest

# -------------------------------------------------------------------------------------
# Remove the existent fluentd config file
# -------------------------------------------------------------------------------------
RUN rm /fluentd/etc/fluent.conf

# -------------------------------------------------------------------------------------
# Copy the fluentd config file
# -------------------------------------------------------------------------------------
COPY ./conf/fluent.conf /fluentd/etc
