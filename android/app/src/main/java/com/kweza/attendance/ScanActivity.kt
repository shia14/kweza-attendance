package com.kweza.attendance

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import com.kweza.attendance.databinding.ActivityScanBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ScanActivity : AppCompatActivity() {

    private lateinit var binding: ActivityScanBinding
    private var pendingScanType: ScanType = ScanType.ARRIVAL

    private val scanLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents == null) {
            Toast.makeText(this, getString(R.string.scan_cancelled), Toast.LENGTH_SHORT).show()
            return@registerForActivityResult
        }

        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
        when (pendingScanType) {
            ScanType.ARRIVAL -> {
                binding.arrivalStatus.text = getString(
                    R.string.arrival_scanned_format,
                    result.contents,
                    timestamp
                )
            }
            ScanType.DEPARTURE -> {
                binding.departureStatus.text = getString(
                    R.string.departure_scanned_format,
                    result.contents,
                    timestamp
                )
            }
        }

        binding.lastScanStatus.text = getString(
            R.string.last_scan_format,
            result.contents,
            timestamp
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityScanBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val name = intent.getStringExtra(EXTRA_NAME).orEmpty()
        val idNumber = intent.getStringExtra(EXTRA_ID).orEmpty()
        binding.userInfo.text = getString(R.string.user_info_format, name, idNumber)

        binding.arrivalButton.setOnClickListener {
            startScan(ScanType.ARRIVAL)
        }

        binding.departureButton.setOnClickListener {
            startScan(ScanType.DEPARTURE)
        }
    }

    private fun startScan(type: ScanType) {
        pendingScanType = type
        val options = ScanOptions()
            .setDesiredBarcodeFormats(ScanOptions.QR_CODE)
            .setPrompt(getString(R.string.scan_prompt))
            .setBeepEnabled(true)
            .setOrientationLocked(true)

        scanLauncher.launch(options)
    }

    private enum class ScanType {
        ARRIVAL,
        DEPARTURE
    }

    companion object {
        const val EXTRA_NAME = "extra_name"
        const val EXTRA_ID = "extra_id"
    }
}
