from pymodbus.payload import BinaryPayloadBuilder

class RemoteConnectorBinaryPayloadBuilder (BinaryPayloadBuilder):

    def add_string_utf8(self, text, max_length):

        if len(text) > max_length:
            text = text[:max_length]
        else:
            text = text.ljust(max_length)

        # Encode UTF-8 string into bytes
        byte_data = text.encode('utf-8')

        # Pad with zero if odd number of bytes (MODBUS requires 2 bytes per register)
        if len(byte_data) % 2 != 0:
            byte_data += b'\x00'

        for i in range(0, max_length * 2 - len(byte_data)):
            byte_data += b'\x00'

        for i in range(0, len(byte_data), 2):
            # Combine 2 bytes into a 16-bit unsigned integer
            high = byte_data[i]
            low = byte_data[i+1]
            val = (high << 8) | low  # Always 0 <= val <= 65535
            self.add_16bit_uint(val)
