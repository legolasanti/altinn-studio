package altinn.platform.pdf.models;

import io.swagger.annotations.ApiModel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@ApiModel(description = "Pages settings")
@Getter
@Setter
public class PagesSettings {
  List<String> order;
  List<String> excludeFromPdf;
}
