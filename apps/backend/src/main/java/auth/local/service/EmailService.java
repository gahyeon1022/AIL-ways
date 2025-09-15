package auth.local.service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender sender;
    public EmailService(JavaMailSender sender) { this.sender = sender; }

    public void sendCode(String to, String code) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("[Alpha] 이메일 인증 코드");
            msg.setText("인증코드: " + code + "\n5분 이내에 입력해 주세요.");
            sender.send(msg);
        } catch (Exception e) {
            throw new EmailSendFailedException("메일 전송 실패: " + e.getMessage());
        }
    }
}
