echo "=======  Creating use traces ==============================="
for USEFILE in *.use; do
    bin/trace-use.sh $USEFILE
done

echo "=======  Creating soil traces =============================="
for SOILFILE in *.soil; do
    bin/trace-soil.sh $SOILFILE
done
