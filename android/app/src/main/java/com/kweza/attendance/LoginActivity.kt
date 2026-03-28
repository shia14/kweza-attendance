package com.kweza.attendance

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.kweza.attendance.databinding.ActivityLoginBinding

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginButton.setOnClickListener {
            val name = binding.nameInput.text?.toString()?.trim().orEmpty()
            val idNumber = binding.idInput.text?.toString()?.trim().orEmpty()

            var valid = true
            if (name.isBlank()) {
                binding.nameLayout.error = getString(R.string.validation_required)
                valid = false
            } else {
                binding.nameLayout.error = null
            }

            if (idNumber.isBlank()) {
                binding.idLayout.error = getString(R.string.validation_required)
                valid = false
            } else {
                binding.idLayout.error = null
            }

            if (!valid) return@setOnClickListener

            val intent = Intent(this, ScanActivity::class.java).apply {
                putExtra(ScanActivity.EXTRA_NAME, name)
                putExtra(ScanActivity.EXTRA_ID, idNumber)
            }
            startActivity(intent)
        }
    }
}
