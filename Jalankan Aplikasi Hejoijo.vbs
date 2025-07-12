' Script untuk menjalankan aplikasi Hejoijo
Option Explicit

Dim shell, fso, currentDir, response

' Buat objek shell dan file system
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Dapatkan direktori saat ini (lokasi script ini)
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Tampilkan pesan selamat datang
response = MsgBox("Selamat datang di Aplikasi Hejoijo!" & vbCrLf & vbCrLf & _
                 "Aplikasi ini akan membantu Anda menghitung penyerapan CO2 dan VOC dari tanaman yang Anda miliki." & vbCrLf & vbCrLf & _
                 "Klik OK untuk melanjutkan.", _
                 vbInformation + vbOKCancel, "Aplikasi Hejoijo")

' Jika pengguna mengklik OK
If response = vbOK Then
    ' Periksa apakah file batch ada
    If fso.FileExists(currentDir & "\run-app.bat") Then
        ' Jalankan file batch
        shell.Run currentDir & "\run-app.bat", 1, False
    Else
        MsgBox "File run-app.bat tidak ditemukan. Pastikan file tersebut berada di folder yang sama dengan script ini.", _
               vbCritical, "Error"
    End If
End If

' Bersihkan objek
Set shell = Nothing
Set fso = Nothing