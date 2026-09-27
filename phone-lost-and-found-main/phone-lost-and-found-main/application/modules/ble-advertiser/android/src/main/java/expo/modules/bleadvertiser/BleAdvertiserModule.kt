package expo.modules.bleadvertiser

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.os.ParcelUuid
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.charset.StandardCharsets
import java.util.UUID

class BleAdvertiserModule : Module() {
  private var advertiser: BluetoothLeAdvertiser? = null
  private var isAdvertising = false
  private var callback: AdvertiseCallback? = null

  @SuppressLint("MissingPermission")
  override fun definition() = ModuleDefinition {
    Name("BleAdvertiser")

    AsyncFunction("startAdvertising") { deviceId: String ->
      val adapter = BluetoothAdapter.getDefaultAdapter()
        ?: throw Exception("Bluetooth adapter is not available on this device")

      if (!adapter.isEnabled) {
        throw Exception("Bluetooth is currently turned off")
      }

      advertiser = adapter.bluetoothLeAdvertiser
        ?: throw Exception("Hardware BLE Advertising (Peripheral mode) is not supported by this chipset")

      val settings = AdvertiseSettings.Builder()
        .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
        .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
        .setConnectable(false)
        .setTimeout(0)
        .build()

      // 16-bit UUID for SPORS Mesh Network
      val serviceUuid = ParcelUuid(UUID.fromString("0000FEAA-0000-1000-8000-00805F9B34FB"))

      val data = AdvertiseData.Builder()
        .setIncludeDeviceName(true)
        .addServiceUuid(serviceUuid)
        .addServiceData(serviceUuid, deviceId.toByteArray(StandardCharsets.UTF_8))
        .build()

      try {
        adapter.name = deviceId
      } catch (ignored: Exception) {}

      callback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
          isAdvertising = true
        }

        override fun onStartFailure(errorCode: Int) {
          isAdvertising = false
        }
      }

      advertiser?.startAdvertising(settings, data, callback)
      "Hardware BLE Advertising started for $deviceId"
    }

    @SuppressLint("MissingPermission")
    AsyncFunction("stopAdvertising") {
      if (isAdvertising && callback != null) {
        advertiser?.stopAdvertising(callback)
        isAdvertising = false
        callback = null
      }
      "Advertising stopped"
    }
  }
}
