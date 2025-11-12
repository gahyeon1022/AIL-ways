package app.service;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import report.service.AiSummaryService;

@Service
@Profile("test")
@Primary
public class MockAiSummaryService implements AiSummaryService {
    @Override
    public String summarize(String text) {
        return "요약 결과";
    }
}
